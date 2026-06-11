import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { appointmentStatuses } from "@/lib/validation";

export function AppointmentFilters({
  query,
  status,
  date
}: {
  query?: string;
  status?: string;
  date?: string;
}) {
  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_170px_170px_auto]">
      <Input name="q" placeholder="Search client or phone" defaultValue={query} />
      <Select name="status" defaultValue={status ?? "All"}>
        <option value="All">All statuses</option>
        {appointmentStatuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
      <Input name="date" type="date" defaultValue={date} />
      <Button type="submit" size="icon" aria-label="Search">
        <Search className="size-4" />
      </Button>
    </form>
  );
}
