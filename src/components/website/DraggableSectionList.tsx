import { useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Copy, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { WebsiteSection, SECTION_LABELS } from "@/types/website";
import { cn } from "@/lib/utils";

interface Props {
  sections: WebsiteSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
}

function SortableItem({ section, isSelected, onSelect, onToggle, onDuplicate }: {
  section: WebsiteSection;
  isSelected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDuplicate?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors group",
        isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted",
        !section.enabled && "opacity-50"
      )}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0 touch-none">
        <GripVertical className="h-4 w-4" />
      </button>
      <button onClick={onSelect} className="flex-1 text-left truncate">
        {SECTION_LABELS[section.type]}
      </button>
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {onDuplicate && section.type !== "navbar" && (
          <button
            onClick={onDuplicate}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
            title="Dupliquer"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        )}
        <Switch
          checked={section.enabled}
          onCheckedChange={onToggle}
          className="shrink-0"
        />
      </div>
    </div>
  );
}

export default function DraggableSectionList({ sections, selectedId, onSelect, onToggle, onDuplicate, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => sections.map(s => s.id), [sections]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    const newIds = arrayMove(ids, oldIndex, newIndex);
    onReorder(newIds);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="space-y-0.5">
          {sections.map(section => (
            <SortableItem
              key={section.id}
              section={section}
              isSelected={selectedId === section.id}
              onSelect={() => onSelect(section.id)}
              onToggle={() => onToggle(section.id)}
              onDuplicate={onDuplicate ? () => onDuplicate(section.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
