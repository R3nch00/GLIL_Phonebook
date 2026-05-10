export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-lg font-medium text-muted-foreground">No employees found</p>
      <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filter</p>
    </div>
  )
}