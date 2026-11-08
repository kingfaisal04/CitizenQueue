/**
 * CitizenQueue - Service Discovery Page
 * 
 * Route: `/services`
 * 
 * Searchable directory of educational and public services with category filters,
 * availability indicators, document checklist previews, and direct booking entry points.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  FileText,
  CalendarCheck,
  AlertCircle,
  Building2,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import { ServiceService } from '../../services/serviceService';
import { SERVICE_CATEGORIES } from '../../data/mockData';

export default function ServiceDiscoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('cat') || 'All Categories';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load services from service layer
  useEffect(() => {
    setIsLoading(true);
    // Simulating quick mock response
    const timer = setTimeout(() => {
      setServices(ServiceService.getAll());
      setIsLoading(false);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  // Update query params when filters change
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All Categories') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', category);
    }
    setSearchParams(newParams);
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (!val) {
      newParams.delete('q');
    } else {
      newParams.set('q', val);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCategory('All Categories');
    setSearchParams({});
  };

  // Filtered results
  const filteredServices = useMemo(() => {
    const cleanQ = query.trim().toLowerCase();
    return services.filter((srv) => {
      const matchesCat =
        selectedCategory === 'All Categories' || srv.category === selectedCategory;
      const matchesText =
        !cleanQ ||
        srv.name.toLowerCase().includes(cleanQ) ||
        srv.institutionName.toLowerCase().includes(cleanQ) ||
        srv.description.toLowerCase().includes(cleanQ) ||
        srv.location.toLowerCase().includes(cleanQ);

      return matchesCat && matchesText;
    });
  }, [services, query, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full">
      
      {/* Header and Context */}
      <div className="max-w-3xl space-y-2 mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cqTeal-700 bg-cqTeal-50 px-2.5 py-1 rounded-full border border-cqTeal-200">
          <Sparkles size={12} />
          <span>Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-cqNavy-950 tracking-tight">
          Find an Educational Service
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Discover Senior High School placement verification, university biometric registration, and certificate collection desks in Ghana.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 space-y-4">
        
        {/* Search Input */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by school (e.g. Achimota, Prempeh, KNUST), service, or campus location..."
            value={query}
            onChange={handleQueryChange}
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cqTeal-500 focus:border-transparent bg-slate-50/50"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('q');
                setSearchParams(newParams);
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Filter size={16} className="text-slate-400 shrink-0 mr-1" />
          {SERVICE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-cqNavy-950 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6 text-sm text-slate-500">
        <span>
          Showing <strong className="text-slate-900">{filteredServices.length}</strong> available service{filteredServices.length === 1 ? '' : 's'}
        </span>
        {(query || selectedCategory !== 'All Categories') && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-cqTeal-700 hover:text-cqTeal-900 font-medium text-xs underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-100 rounded" />
              <div className="h-10 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      ) : filteredServices.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Search size={28} />
          </div>
          <h3 className="font-bold text-lg text-slate-900">
            No matching services found
          </h3>
          <p className="text-sm text-slate-500">
            We couldn't find any services matching "{query}" in "{selectedCategory}". Try checking your spelling or clearing active filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 bg-cqNavy-950 text-white rounded-lg text-sm font-medium hover:bg-cqNavy-900"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Service Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const hasSlots = service.hasAvailability && service.isActive;

            return (
              <div
                key={service.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6 space-y-4">
                  
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-cqTeal-800 bg-cqTeal-50 px-2.5 py-0.5 rounded-md border border-cqTeal-200 truncate">
                      {service.category}
                    </span>

                    {hasSlots ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Slots Open
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                        Currently Full
                      </span>
                    )}
                  </div>

                  {/* Institution Name */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Building2 size={13} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-700 truncate">
                      {service.institutionName}
                    </span>
                  </div>

                  {/* Service Title */}
                  <h3 className="font-bold text-lg text-cqNavy-950 leading-snug group-hover:text-cqTeal-700 transition-colors">
                    <Link to={`/services/${service.id}`}>
                      {service.name}
                    </Link>
                  </h3>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Metadata Chips: Location & Requirements */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{service.location}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>Approx. {service.durationMinutes} mins</span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-600 font-medium">
                        <FileText size={13} className="text-slate-400 shrink-0" />
                        <span>{service.requirements?.length || 0} required docs</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Card Actions Bottom */}
                <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between gap-2">
                  <Link
                    to={`/services/${service.id}`}
                    className="text-xs font-semibold text-slate-700 hover:text-cqNavy-950 transition-colors"
                  >
                    View Details & Checklist
                  </Link>

                  {hasSlots ? (
                    <Link
                      to={`/book/${service.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cqTeal-600 hover:bg-cqTeal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                    >
                      <CalendarCheck size={14} />
                      <span>Book Slot</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-200 text-slate-400 rounded-lg text-xs font-medium cursor-not-allowed"
                    >
                      No Open Slots
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Honest Availability Notice */}
      <div className="mt-12 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Civic Availability Principle:</span> If an educational service indicates "Currently Full", CitizenQueue does not allow circumventing or purchasing priority access. Capacity is matched to verified staff coverage to prevent long lines.
        </div>
      </div>

    </div>
  );
}
