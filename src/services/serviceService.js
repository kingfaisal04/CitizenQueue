/**
 * CitizenQueue - Service & Availability Service Layer
 * 
 * Manages service catalog, document requirements, and appointment slot capacity.
 */

import { Storage } from './storageService';

export const ServiceService = {
  /**
   * Get all services
   */
  getAll: () => {
    return Storage.getServices();
  },

  /**
   * Find a service by ID
   */
  getById: (id) => {
    const services = Storage.getServices();
    return services.find((s) => s.id === id) || null;
  },

  /**
   * Search and filter services
   */
  search: (query = '', category = 'All Categories') => {
    const services = Storage.getServices();
    const cleanQuery = query.trim().toLowerCase();

    return services.filter((srv) => {
      const matchesCategory =
        category === 'All Categories' || srv.category === category;

      const matchesQuery =
        !cleanQuery ||
        srv.name.toLowerCase().includes(cleanQuery) ||
        srv.institutionName.toLowerCase().includes(cleanQuery) ||
        srv.description.toLowerCase().includes(cleanQuery) ||
        srv.location.toLowerCase().includes(cleanQuery);

      return matchesCategory && matchesQuery;
    });
  },

  /**
   * Create a new demonstration service
   */
  create: (serviceData) => {
    const services = Storage.getServices();
    const newId = `srv-${Date.now()}`;
    const newService = {
      id: newId,
      institutionId: serviceData.institutionId || 'inst-1',
      institutionName: serviceData.institutionName || 'Achimota Senior High School',
      name: serviceData.name.trim(),
      category: serviceData.category || 'Admissions & Enrollment',
      description: serviceData.description.trim(),
      location: serviceData.location.trim() || 'Administration Block',
      durationMinutes: Number(serviceData.durationMinutes) || 20,
      isActive: serviceData.isActive !== false,
      hasAvailability: true,
      delayNotice: serviceData.delayNotice?.trim() || null,
      requirements: Array.isArray(serviceData.requirements)
        ? serviceData.requirements
        : serviceData.requirements
        ? serviceData.requirements.split('\n').filter(Boolean)
        : [],
      instructions: serviceData.instructions?.trim() || 'Please arrive 10 minutes before your slot.',
      cancellationPolicy: serviceData.cancellationPolicy?.trim() || 'Can be rescheduled up to 2 hours in advance.'
    };

    const updated = [newService, ...services];
    Storage.setServices(updated);

    // Seed default availability for newly created service
    const allAvailability = Storage.getAvailability();
    allAvailability[newId] = [
      {
        date: "2026-10-27",
        slots: [
          { id: `slot-${Date.now()}-1`, time: "09:00 AM", capacity: 8, bookedCount: 0 },
          { id: `slot-${Date.now()}-2`, time: "11:00 AM", capacity: 8, bookedCount: 0 },
          { id: `slot-${Date.now()}-3`, time: "02:00 PM", capacity: 8, bookedCount: 0 }
        ]
      }
    ];
    Storage.setAvailability(allAvailability);

    return newService;
  },

  /**
   * Update an existing demonstration service
   */
  update: (id, updatedFields) => {
    const services = Storage.getServices();
    const index = services.findIndex((s) => s.id === id);
    if (index === -1) return null;

    services[index] = {
      ...services[index],
      ...updatedFields
    };

    Storage.setServices(services);
    return services[index];
  },

  /**
   * Toggle service active status
   */
  toggleStatus: (id) => {
    const services = Storage.getServices();
    const target = services.find((s) => s.id === id);
    if (!target) return null;

    target.isActive = !target.isActive;
    Storage.setServices(services);
    return target;
  },

  /**
   * Get availability for a specific service
   */
  getAvailability: (serviceId) => {
    const allAvailability = Storage.getAvailability();
    return allAvailability[serviceId] || [];
  },

  /**
   * Update entire availability schedule for a service
   */
  updateAvailability: (serviceId, datesArray) => {
    const allAvailability = Storage.getAvailability();
    allAvailability[serviceId] = datesArray;
    Storage.setAvailability(allAvailability);
    return datesArray;
  },

  /**
   * Add a new slot to a service on a given date
   */
  addSlot: (serviceId, dateStr, { time, capacity }) => {
    const allAvailability = Storage.getAvailability();
    let serviceDates = allAvailability[serviceId] || [];

    let dateEntry = serviceDates.find((d) => d.date === dateStr);
    if (!dateEntry) {
      dateEntry = { date: dateStr, slots: [] };
      serviceDates.push(dateEntry);
    }

    const newSlot = {
      id: `slot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      time,
      capacity: Number(capacity) || 5,
      bookedCount: 0
    };

    dateEntry.slots.push(newSlot);
    allAvailability[serviceId] = serviceDates;
    Storage.setAvailability(allAvailability);

    return newSlot;
  },

  /**
   * Update capacity of an existing slot
   */
  updateSlotCapacity: (serviceId, slotId, newCapacity) => {
    const allAvailability = Storage.getAvailability();
    const serviceDates = allAvailability[serviceId] || [];

    let updatedSlot = null;
    for (const d of serviceDates) {
      const slot = d.slots.find((s) => s.id === slotId);
      if (slot) {
        slot.capacity = Math.max(slot.bookedCount, Number(newCapacity));
        updatedSlot = slot;
        break;
      }
    }

    if (updatedSlot) {
      allAvailability[serviceId] = serviceDates;
      Storage.setAvailability(allAvailability);
    }

    return updatedSlot;
  }
};
