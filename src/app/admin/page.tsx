"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const resources = [
  { key: "customers", label: "Customers", columns: ["Name", "Created" ] },
  { key: "orders", label: "Orders", columns: ["Customer", "Product", "Qty", "Due" ] },
  { key: "products", label: "Products", columns: ["Name", "Customer", "Punnet Size", "Multi-type" ] },
  { key: "sites", label: "Sites", columns: ["Name", "Lines" ] },
  { key: "production-lines", label: "Production Lines", columns: ["Name", "Site" ] },
  { key: "punnet-sizes", label: "Punnet Sizes", columns: ["Name", "Size (g)" ] },
  { key: "fruits", label: "Fruits", columns: ["Name", "Variants" ] },
  { key: "fruit-variants", label: "Fruit Variants", columns: ["Name", "Fruit" ] },
  { key: "master-run-rates", label: "Master Run Rates", columns: ["Punnet Size", "Line", "PPM" ] },
  { key: "specific-run-rates", label: "Specific Run Rates", columns: ["Product", "Line", "PPM" ] },
  { key: "master-changeovers", label: "Master Changeovers", columns: ["From Size", "To Size", "Minutes" ] },
  { key: "specific-changeovers", label: "Specific Changeovers", columns: ["From Product", "To Product", "Minutes" ] },
  { key: "product-varieties", label: "Product Varieties", columns: ["Product", "Variant", "Preferred" ] },
];

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <Tabs defaultValue="customers" className="w-full">
        <TabsList className="flex flex-wrap gap-1">
          {resources.map((r) => (
            <TabsTrigger key={r.key} value={r.key} className="text-xs sm:text-sm">
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {resources.map((r) => (
          <TabsContent key={r.key} value={r.key} className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-black/70 dark:text-white/70">Manage {r.label.toLowerCase()}</div>
              <Button size="sm">New</Button>
            </div>
            <ScrollArea className="border rounded-md max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    {r.columns.map((c) => (
                      <TableHead key={c} className="whitespace-nowrap">{c}</TableHead>
                    ))}
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={r.columns.length + 1} className="text-center text-sm py-10 text-black/60 dark:text-white/60">
                      No data yet.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
