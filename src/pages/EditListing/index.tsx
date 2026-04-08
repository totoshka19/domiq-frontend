import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ImagePlus, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { PageLayout } from '@/components/layout/PageLayout';
import { useListing } from '@/hooks/useListings';
import { listingsApi } from '@/api/listings';
import { filesApi } from '@/api/files';
import type { DealType, PropertyType, Photo } from '@/types/listing';

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: listing, isLoading } = useListing(id ?? '');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dealType, setDealType] = useState<DealType>('sale');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('RUB');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('1');
  const [floor, setFloor] = useState('');
  const [floorsTotal, setFloorsTotal] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [existingPhotos, setExistingPhotos] = useState<Photo[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Заполняем форму при загрузке
  useEffect(() => {
    if (!listing) return;
    setTitle(listing.title);
    setDescription(listing.description);
    setDealType(listing.deal_type);
    setPropertyType(listing.property_type);
    setPrice(String(Math.round(Number(listing.price))));
    setCurrency(listing.currency);
    setArea(String(listing.area));
    setRooms(String(listing.rooms));
    setFloor(String(listing.floor));
    setFloorsTotal(String(listing.floors_total));
    setCity(listing.city);
    setDistrict(listing.district);
    setAddress(listing.address);
    setExistingPhotos([...listing.photos].sort((a, b) => a.order - b.order));
  }, [listing]);

  const clearError = (key: string) => setErrors((v) => ({ ...v, [key]: undefined as unknown as string }));

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Введите заголовок';
    if (!price || Number(price) <= 0) e.price = 'Введите цену';
    if (!area || Number(area) <= 0) e.area = 'Введите площадь';
    if (!city.trim()) e.city = 'Введите город';
    if (!address.trim()) e.address = 'Введите адрес';
    if (!district.trim()) e.district = 'Введите район';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const total = existingPhotos.length + newFiles.length;
    const toAdd = Array.from(files).slice(0, 10 - total);
    const previews = toAdd.map((f) => URL.createObjectURL(f));
    setNewFiles((p) => [...p, ...toAdd]);
    setNewPreviews((p) => [...p, ...previews]);
  };

  const handleDeleteExisting = async (photo: Photo) => {
    try {
      await filesApi.deletePhoto(photo.id);
      setExistingPhotos((p) => p.filter((ph) => ph.id !== photo.id));
    } catch {
      toast.error('Не удалось удалить фото');
    }
  };

  const handleRemoveNew = (index: number) => {
    URL.revokeObjectURL(newPreviews[index]);
    setNewFiles((p) => p.filter((_, i) => i !== index));
    setNewPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (dropIndex: number) => {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...existingPhotos];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Обновляем is_main: первое фото — главное
    const updated = reordered.map((p, i) => ({ ...p, is_main: i === 0, order: i }));

    setExistingPhotos(updated);
    setDragIndex(null);
    setDragOverIndex(null);

    try {
      await listingsApi.reorderPhotos(id!, updated.map((p) => ({
        photo_id: p.id,
        order: p.order,
        is_main: p.is_main,
      })));
    } catch {
      toast.error('Не удалось изменить порядок фото');
      setExistingPhotos(existingPhotos);
    }
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !id) return;
    setIsSaving(true);
    try {
      await listingsApi.update(id, {
        title: title.trim(),
        description: description.trim(),
        deal_type: dealType,
        property_type: propertyType,
        price: Number(price),
        currency,
        area: Number(area),
        rooms: Number(rooms),
        floor: Number(floor) || 0,
        floors_total: Number(floorsTotal) || 0,
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
      });

      if (newFiles.length > 0) {
        try {
          await filesApi.upload(id, newFiles);
        } catch {
          toast.warning('Данные сохранены, но новые фото не загрузились');
        }
      }

      toast.success('Объявление обновлено');
      navigate(`/listings/${id}`);
    } catch {
      toast.error('Не удалось сохранить изменения');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </PageLayout>
    );
  }

  if (!listing) {
    return (
      <PageLayout>
        <div className="text-center py-20 text-muted-foreground">Объявление не найдено</div>
      </PageLayout>
    );
  }

  const totalPhotos = existingPhotos.length + newFiles.length;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Редактировать объявление</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Основное */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Основное</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Заголовок *</Label>
              <Input id="title" value={title} onChange={(e) => { setTitle(e.target.value); clearError('title'); }} placeholder="Например: 2-комнатная квартира у метро" className={errors.title ? 'border-destructive' : ''} />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Тип сделки *</Label>
              <div className="flex gap-2">
                {(['sale', 'rent'] as const).map((t) => (
                  <Button key={t} type="button" variant={dealType === t ? 'default' : 'outline'} className="flex-1" onClick={() => setDealType(t)}>
                    {t === 'sale' ? 'Продажа' : 'Аренда'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="property_type">Тип недвижимости *</Label>
              <Select value={propertyType} onValueChange={(v) => setPropertyType(v as PropertyType)}>
                <SelectTrigger id="property_type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Квартира</SelectItem>
                  <SelectItem value="house">Дом</SelectItem>
                  <SelectItem value="commercial">Коммерческая</SelectItem>
                  <SelectItem value="land">Участок</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* Характеристики */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Характеристики</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price">Цена, ₽ *</Label>
                <Input id="price" type="number" min="0" value={price} onChange={(e) => { setPrice(e.target.value); clearError('price'); }} className={errors.price ? 'border-destructive' : ''} />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="area">Площадь, м² *</Label>
                <Input id="area" type="number" min="0" value={area} onChange={(e) => { setArea(e.target.value); clearError('area'); }} className={errors.area ? 'border-destructive' : ''} />
                {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rooms">Комнат</Label>
                <Select value={rooms} onValueChange={setRooms}>
                  <SelectTrigger id="rooms"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Студия</SelectItem>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency">Валюта</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RUB">₽ Рубль</SelectItem>
                    <SelectItem value="USD">$ Доллар</SelectItem>
                    <SelectItem value="EUR">€ Евро</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="floor">Этаж</Label>
                <Input id="floor" type="number" min="0" value={floor} onChange={(e) => setFloor(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="floors_total">Этажей всего</Label>
                <Input id="floors_total" type="number" min="0" value={floorsTotal} onChange={(e) => setFloorsTotal(e.target.value)} />
              </div>
            </div>
          </section>

          {/* Расположение */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Расположение</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">Город *</Label>
                <Input id="city" value={city} onChange={(e) => { setCity(e.target.value); clearError('city'); }} className={errors.city ? 'border-destructive' : ''} />
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="district">Район *</Label>
                <Input id="district" value={district} onChange={(e) => { setDistrict(e.target.value); clearError('district'); }} className={errors.district ? 'border-destructive' : ''} />
                {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Адрес *</Label>
              <Input id="address" value={address} onChange={(e) => { setAddress(e.target.value); clearError('address'); }} className={errors.address ? 'border-destructive' : ''} />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
            </div>
          </section>

          {/* Описание */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Описание</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Расскажите подробнее об объекте..."
              rows={5}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </section>

          {/* Фотографии */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Фотографии</h2>
              <span className="text-xs text-muted-foreground">{totalPhotos} / 10</span>
            </div>

            {totalPhotos > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {existingPhotos.map((photo, i) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={(e) => { e.preventDefault(); handleDrop(i); }}
                    onDragEnd={handleDragEnd}
                    className={[
                      'relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing transition-opacity',
                      dragIndex === i ? 'opacity-40' : 'opacity-100',
                      dragOverIndex === i && dragIndex !== i ? 'ring-2 ring-primary ring-offset-1' : '',
                    ].join(' ')}
                  >
                    <img src={photo.url} alt={`Фото ${i + 1}`} draggable={false} className="w-full h-full object-cover pointer-events-none" loading="lazy" />
                    {/* Ручка перетаскивания */}
                    <div className="absolute top-1 left-1 w-5 h-5 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-3 h-3 text-white" />
                    </div>
                    {/* Удалить */}
                    <button
                      type="button"
                      onClick={() => handleDeleteExisting(photo)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Удалить фото"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {photo.is_main && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">Главное</span>
                    )}
                  </div>
                ))}
                {newPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={src} alt={`Новое фото ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveNew(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Удалить фото"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-[10px] bg-primary/80 text-white px-1.5 py-0.5 rounded">Новое</span>
                  </div>
                ))}
              </div>
            )}

            {existingPhotos.length > 1 && (
              <p className="text-xs text-muted-foreground">Перетащите фото для изменения порядка. Первое фото — главное.</p>
            )}

            {totalPhotos < 10 && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm">Добавить фотографии</span>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleAddPhotos(e.target.files)} />
              </>
            )}
          </section>

          <Separator />

          <div className="flex items-center gap-3 pb-6">
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? 'Сохраняем...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(`/listings/${id}`)}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default EditListing;
