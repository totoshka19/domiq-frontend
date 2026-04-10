import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ImagePlus, X } from 'lucide-react';
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
import { PageLayout } from '@/components/layout/PageLayout';
import { listingsApi } from '@/api/listings';
import { filesApi } from '@/api/files';
import { useGeocoding } from '@/hooks/useGeocoding';
import type { DealType, PropertyType } from '@/types/listing';

interface FormState {
  title: string;
  description: string;
  deal_type: DealType;
  property_type: PropertyType;
  price: string;
  currency: string;
  area: string;
  rooms: string;
  floor: string;
  floors_total: string;
  city: string;
  district: string;
  address: string;
  latitude: string;
  longitude: string;
}

interface FormErrors {
  [key: string]: string | undefined;
}

const initialForm: FormState = {
  title: '',
  description: '',
  deal_type: 'sale',
  property_type: 'apartment',
  price: '',
  currency: 'RUB',
  area: '',
  rooms: '1',
  floor: '',
  floors_total: '',
  city: '',
  district: '',
  address: '',
  latitude: '0',
  longitude: '0',
};

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Геокодинг: строим запрос из города + адреса, получаем lat/lon автоматически
  const geocodeQuery = useMemo(
    () => [form.city, form.address].filter(Boolean).join(', '),
    [form.city, form.address],
  );
  const { result: geoResult, isLoading: isGeocoding } = useGeocoding(geocodeQuery);

  // При успешном геокодинге — обновляем координаты в форме
  useEffect(() => {
    if (geoResult) {
      setForm((v) => ({
        ...v,
        latitude: String(geoResult.latitude),
        longitude: String(geoResult.longitude),
      }));
    }
  }, [geoResult]);

  const set = (key: keyof FormState, value: string) => {
    setForm((v) => ({ ...v, [key]: value }));
    setErrors((v) => ({ ...v, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = 'Введите заголовок';
    if (!form.price || Number(form.price) <= 0) e.price = 'Введите цену';
    if (!form.area || Number(form.area) <= 0) e.area = 'Введите площадь';
    if (!form.city.trim()) e.city = 'Введите город';
    if (!form.address.trim()) e.address = 'Введите адрес';
    if (!form.district.trim()) e.district = 'Введите район';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePhotos = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 10 - photos.length);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPhotos((p) => [...p, ...newFiles]);
    setPreviews((p) => [...p, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setPhotos((p) => p.filter((_, i) => i !== index));
    setPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const listing = await listingsApi.create({
        title: form.title.trim(),
        description: form.description.trim(),
        deal_type: form.deal_type,
        property_type: form.property_type,
        price: Number(form.price),
        currency: form.currency,
        area: Number(form.area),
        rooms: Number(form.rooms),
        floor: Number(form.floor) || 0,
        floors_total: Number(form.floors_total) || 0,
        city: form.city.trim(),
        district: form.district.trim(),
        address: form.address.trim(),
        latitude: Number(form.latitude) || 0,
        longitude: Number(form.longitude) || 0,
      });

      if (photos.length > 0) {
        try {
          await filesApi.upload(listing.id, photos);
        } catch {
          toast.warning('Объявление создано, но фото не удалось загрузить');
        }
      }

      toast.success('Объявление опубликовано!');
      navigate(`/listings/${listing.id}`);
    } catch {
      toast.error('Не удалось создать объявление. Попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Разместить объявление</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* ─── Основная информация ─── */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Основное</h2>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Заголовок *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="Например: 2-комнатная квартира у метро"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            {/* Тип сделки */}
            <div className="flex flex-col gap-1.5">
              <Label>Тип сделки *</Label>
              <div className="flex gap-2">
                {(['sale', 'rent'] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    variant={form.deal_type === t ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => set('deal_type', t)}
                  >
                    {t === 'sale' ? 'Продажа' : 'Аренда'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Тип недвижимости */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="property_type">Тип недвижимости *</Label>
              <Select value={form.property_type} onValueChange={(v) => set('property_type', v as PropertyType)}>
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

          {/* ─── Характеристики ─── */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Характеристики</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price">Цена, ₽ *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="0"
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="area">Площадь, м² *</Label>
                <Input
                  id="area"
                  type="number"
                  min="0"
                  value={form.area}
                  onChange={(e) => set('area', e.target.value)}
                  placeholder="0"
                  className={errors.area ? 'border-destructive' : ''}
                />
                {errors.area && <p className="text-xs text-destructive">{errors.area}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rooms">Комнат</Label>
                <Select value={form.rooms} onValueChange={(v) => set('rooms', v)}>
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
                <Select value={form.currency} onValueChange={(v) => set('currency', v)}>
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
                <Input
                  id="floor"
                  type="number"
                  min="0"
                  value={form.floor}
                  onChange={(e) => set('floor', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="floors_total">Этажей всего</Label>
                <Input
                  id="floors_total"
                  type="number"
                  min="0"
                  value={form.floors_total}
                  onChange={(e) => set('floors_total', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </section>

          {/* ─── Расположение ─── */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Расположение</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">Город *</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="Москва"
                  className={errors.city ? 'border-destructive' : ''}
                />
                {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="district">Район *</Label>
                <Input
                  id="district"
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  placeholder="Центральный"
                  className={errors.district ? 'border-destructive' : ''}
                />
                {errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Адрес *</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="ул. Примерная, д. 1"
                className={errors.address ? 'border-destructive' : ''}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
              {/* Статус геокодинга */}
              {isGeocoding && (
                <p className="text-xs text-muted-foreground">Определяем координаты...</p>
              )}
              {!isGeocoding && geoResult && (
                <p className="text-xs text-green-600">✓ Координаты определены</p>
              )}
            </div>
          </section>

          {/* ─── Описание ─── */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Описание</h2>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Описание объекта</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Расскажите подробнее об объекте: состояние, инфраструктура, особенности..."
                rows={5}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>
          </section>

          {/* ─── Фотографии ─── */}
          <section className="bg-white border rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Фотографии</h2>
              <span className="text-xs text-muted-foreground">{photos.length} / 10</span>
            </div>

            {/* Превью */}
            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                    <img src={src} alt={`Фото ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Удалить фото"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1.5 py-0.5 rounded">
                        Главное
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Кнопка добавления */}
            {photos.length < 10 && (
              <>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-8 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="text-sm">Добавить фотографии</span>
                  <span className="text-xs">JPG, PNG до 5 МБ</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotos(e.target.files)}
                />
              </>
            )}
          </section>

          <Separator />

          {/* Кнопки */}
          <div className="flex items-center gap-3 pb-6">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? 'Публикуем...' : 'Опубликовать'}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate(-1)}>
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default CreateListing;
