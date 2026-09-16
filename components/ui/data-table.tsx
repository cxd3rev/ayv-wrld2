import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T>({
  columns,
  rows,
  loading,
  emptyTitle = "Nothing here yet",
  emptyDescription = "When data appears, it will show up in this table.",
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (loading) return <LoadingState />;
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Table>
      <THead>
        <TR>
          {columns.map((column) => (
            <TH key={column.key}>{column.header}</TH>
          ))}
        </TR>
      </THead>
      <TBody>
        {rows.map((row, index) => (
          <TR key={index}>
            {columns.map((column) => (
              <TD key={column.key}>{column.render(row)}</TD>
            ))}
          </TR>
        ))}
      </TBody>
    </Table>
  );
}
