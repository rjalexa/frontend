// components/entities/EntitiesPanel.tsx
import React, { useState, useEffect } from "react";
import { Microscope, MapPin, User, Building } from "lucide-react";
import Image from "next/image";
import type { Article, Entity, EntityKind } from '@/lib/types';
import type { BasePanelProps } from '../article/panels/types';
import EntityCard from './EntityCard';

interface EntitiesPanelProps extends BasePanelProps {
  article: Article;
}

type EntityTypeFilter = "all" | EntityKind;

export function EntitiesPanel({ isOpen, onClose, article }: EntitiesPanelProps) {
  const [selectedType, setSelectedType] = useState<EntityTypeFilter>("all");

  // Handle escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscKey);
      return () => window.removeEventListener('keydown', handleEscKey);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filterEntities = (): Entity[] => {
    if (!article?.meta_data) return [];

    const entities =
      selectedType === "all"
        ? article.meta_data
        : article.meta_data.filter((entity) => entity.kind === selectedType);

    return entities.sort((a, b) => {
      const typePriority: Record<EntityKind, number> = {
        location: 1,
        person: 2,
        organization: 3,
      };

      const priorityDiff = typePriority[a.kind] - typePriority[b.kind];
      if (priorityDiff === 0) {
        return a.label.localeCompare(b.label, "en", { sensitivity: "base" });
      }
      return priorityDiff;
    });
  };

  return (
    <div className="mb-8 border rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between w-full p-4 border-b">
        <div className="flex items-center gap-2 text-blue-700 bg-blue-100 px-4 py-2 rounded-md">
          <Microscope className="w-4 h-4" />
          <span>Entità e dettagli</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close panel"
          >
            ✕
          </button>
          <Image 
            src="/mema.svg" 
            alt="MeMa Logo" 
            width={64}
            height={24}
            className="ml-6"
          />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded transition-colors ${
              selectedType === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType("person")}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedType === "person"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            <User className="w-4 h-4" /> Persone
          </button>
          <button
            onClick={() => setSelectedType("location")}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedType === "location"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            <MapPin className="w-4 h-4" /> Luoghi
          </button>
          <button
            onClick={() => setSelectedType("organization")}
            className={`px-4 py-2 rounded flex items-center gap-2 transition-colors ${
              selectedType === "organization"
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            <Building className="w-4 h-4" /> Organizzazioni
          </button>
        </div>

        {article.meta_data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterEntities().map((entity) => (
              <EntityCard key={entity.id || entity.label} entity={entity} />
            ))}
          </div>
        ) : (
          <div className="text-gray-700">
            No entity data available for this article
          </div>
        )}
      </div>
    </div>
  );
}