"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
} from "@dnd-kit/core";
import { useDraggable, useDroppable } from "@dnd-kit/core";

// Mocked types for now
type Order = {
  id: string;
  customer: string;
  product: string;
  quantityPacks: number;
};

type Line = { id: string; name: string };

type PlanItem = {
  id: string;
  orderId: string;
  lineId: string;
  startAt: Date;
  endAt: Date;
  setupMinutes: number;
  runMinutes: number;
  kind: "PLANNED" | "ACTUAL";
};

const mockOrders: Order[] = [
  { id: "o1", customer: "Customer A", product: "Blueberry 200g", quantityPacks: 12000 },
  { id: "o2", customer: "Customer B", product: "Raspberry 150g", quantityPacks: 8000 },
  { id: "o3", customer: "Customer C", product: "Mix Rasp/Blue 2x100g", quantityPacks: 6000 },
];

const mockLines: Line[] = [
  { id: "l1", name: "Line 1" },
  { id: "l2", name: "Line 2" },
  { id: "l3", name: "Line 3" },
];

export default function PlanningPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    open: boolean;
    order?: Order;
    line?: Line;
    computed?: { setupMinutes: number; runMinutes: number; totalMinutes: number };
  }>({ open: false });

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string;
    setActiveOrderId(id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const orderId = activeOrderId;
    setActiveOrderId(null);
    if (!orderId) return;

    const overId = event.over?.id as string | undefined;
    if (!overId) return;

    const order = orders.find((o) => o.id === orderId);
    const line = mockLines.find((l) => l.id === overId);
    if (!order || !line) return;

    const computed = computePlan(order, line, planItems);
    setModalState({ open: true, order, line, computed });
  }

  function confirmPlan() {
    if (!modalState.order || !modalState.line || !modalState.computed) return;

    const now = new Date();
    const setupMs = modalState.computed.setupMinutes * 60 * 1000;
    const runMs = modalState.computed.runMinutes * 60 * 1000;
    const startAt = new Date(now.getTime());
    const endAt = new Date(now.getTime() + setupMs + runMs);

    const newItem: PlanItem = {
      id: `pi_${Date.now()}`,
      orderId: modalState.order.id,
      lineId: modalState.line.id,
      startAt,
      endAt,
      setupMinutes: modalState.computed.setupMinutes,
      runMinutes: modalState.computed.runMinutes,
      kind: "PLANNED",
    };

    setPlanItems((prev) => [...prev, newItem]);
    setModalState({ open: false });
  }

  return (
    <div className="grid grid-cols-[4fr_1fr] gap-4">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Production Plan</h2>
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="space-y-4">
            {mockLines.map((line) => (
              <Lane key={line.id} line={line} items={planItems.filter((p) => p.lineId === line.id)} />
            ))}
          </div>
          <DragOverlay>
            {activeOrderId ? (
              <div className="rounded-md border bg-white/80 dark:bg-black/40 px-3 py-2 shadow text-sm">
                {orders.find((o) => o.id === activeOrderId)?.product}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="space-y-2 overflow-y-auto max-h-[70vh] pr-1">
          {orders.map((o) => (
            <DraggableOrderCard key={o.id} order={o} />
          ))}
        </div>
      </div>

      {modalState.open && modalState.order && modalState.line && modalState.computed ? (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-background text-foreground rounded-lg shadow-xl w-full max-w-md p-4 space-y-3">
            <h3 className="text-lg font-semibold">Confirm plan</h3>
            <p className="text-sm">Order: <span className="font-medium">{modalState.order.product}</span></p>
            <p className="text-sm">Line: <span className="font-medium">{modalState.line.name}</span></p>
            <div className="text-sm grid grid-cols-2 gap-2">
              <div>Setup: {modalState.computed.setupMinutes} min</div>
              <div>Run: {modalState.computed.runMinutes} min</div>
              <div className="col-span-2 font-medium">Total: {modalState.computed.totalMinutes} min</div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-3 py-1.5 text-sm border rounded-md" onClick={() => setModalState({ open: false })}>Cancel</button>
              <button className="px-3 py-1.5 text-sm border rounded-md bg-foreground text-background" onClick={confirmPlan}>Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DraggableOrderCard({ order }: { order: Order }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id });
  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="rounded-lg border p-3 cursor-grab active:cursor-grabbing bg-background hover:bg-black/5 dark:hover:bg-white/5">
      <div className="text-sm font-medium">{order.product}</div>
      <div className="text-xs text-black/70 dark:text-white/70">{order.customer}</div>
      <div className="text-xs">Qty: {order.quantityPacks.toLocaleString()} packs</div>
    </div>
  );
}

function Lane({ line, items }: { line: Line; items: PlanItem[] }) {
  const { isOver, setNodeRef } = useDroppable({ id: line.id });
  return (
    <div>
      <div className="text-sm font-medium mb-2">{line.name}</div>
      <div
        ref={setNodeRef}
        className="rounded-md border h-40 overflow-hidden"
        style={{ background: isOver ? "rgba(59,130,246,0.08)" : "repeating-linear-gradient(90deg,transparent,transparent 44px,rgba(0,0,0,.06) 45px)" }}
      >
        <div className="grid grid-rows-2 h-full">
          <div className="relative">
            {items
              .filter((i) => i.kind === "PLANNED")
              .map((i) => (
                <PlannedCard key={i.id} item={i} />
              ))}
          </div>
          <div className="relative border-t">
            {items
              .filter((i) => i.kind === "ACTUAL")
              .map((i) => (
                <ActualCard key={i.id} item={i} />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlannedCard({ item }: { item: PlanItem }) {
  const total = item.setupMinutes + item.runMinutes;
  const setupPct = (item.setupMinutes / total) * 100;
  const runPct = (item.runMinutes / total) * 100;

  return (
    <div className="absolute left-4 top-3 w-[60%] h-6 rounded-sm overflow-hidden shadow flex text-[10px]">
      <div className="bg-amber-400/70 text-black px-1" style={{ width: `${setupPct}%` }}>
        setup {item.setupMinutes}m
      </div>
      <div className="bg-emerald-500/70 text-black px-1" style={{ width: `${runPct}%` }}>
        run {item.runMinutes}m
      </div>
    </div>
  );
}

function ActualCard({ item }: { item: PlanItem }) {
  return (
    <div className="absolute left-4 top-2 w-[40%] h-6 rounded-sm overflow-hidden shadow flex text-[10px]">
      <div className="bg-blue-500/70 text-white px-1 w-full">actual</div>
    </div>
  );
}

function computePlan(order: Order, _line: Line, _existing: PlanItem[]) {
  // Stub: setup 10 min, run rate 150 ppm
  const setupMinutes = 10;
  const ratePacksPerMinute = 150;
  const runMinutes = Math.ceil(order.quantityPacks / ratePacksPerMinute);
  const totalMinutes = setupMinutes + runMinutes;
  return { setupMinutes, runMinutes, totalMinutes };
}
