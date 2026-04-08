import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/layout/PageLayout';
import { SearchAutocomplete } from '@/components/listing/SearchAutocomplete';
import { ListingCard } from '@/components/listing/ListingCard';
import { ListingGridSkeleton } from '@/components/listing/ListingCardSkeleton';
import { useListings } from '@/hooks/useListings';

const Home: React.FC = () => {
  const { data, isLoading, isError } = useListings({
    limit: 6,
    sort_by: 'created_at',
    sort_order: 'desc',
    status: 'active',
  });

  return (
    <PageLayout>
      {/* Hero */}
      <section className="py-12 md:py-20 text-center flex flex-col items-center gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Найдите своё идеальное жильё
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mx-auto">
            Тысячи объявлений о продаже и аренде недвижимости по всей России
          </p>
        </div>
        <SearchAutocomplete
          size="lg"
          placeholder="Город, район или адрес..."
          className="w-full max-w-xl"
        />
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Button variant="outline" size="sm" asChild>
            <Link to="/listings?deal_type=sale">Купить квартиру</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/listings?deal_type=rent">Снять жильё</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/listings?property_type=house">Дома и дачи</Link>
          </Button>
        </div>
      </section>

      {/* Свежие объявления */}
      <section className="py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Свежие объявления</h2>
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link to="/listings">
              Все объявления
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {isLoading && <ListingGridSkeleton count={6} />}

        {isError && (
          <div className="text-center py-12 text-muted-foreground">
            Не удалось загрузить объявления. Попробуйте позже.
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Пока нет объявлений
          </div>
        )}
      </section>

      {/* CTA для агентов */}
      <section className="py-8">
        <div className="rounded-2xl bg-primary/5 border border-primary/10 px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <h3 className="text-xl font-semibold">Вы агент или застройщик?</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Размещайте объявления бесплатно и находите покупателей и арендаторов быстрее.
            </p>
          </div>
          <Button asChild className="flex-shrink-0">
            <Link to="/register">Разместить объявление</Link>
          </Button>
        </div>
      </section>
    </PageLayout>
  );
};

export default Home;
