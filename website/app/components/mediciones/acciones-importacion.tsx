import { Menu } from "../ui/menu";
import { IconifyIcon } from "../ui/iconify-icon";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../shadcn/tooltip";

interface AccionesImportacionProps {
  onEdit: () => void;
  onDelete: () => void;
  issues?: { message: string }[];
}

export function AccionesImportacion({ onEdit, onDelete, issues = [] }: AccionesImportacionProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {issues.length > 0 && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2 text-destructive cursor-help">
                <IconifyIcon variant="info" className="text-base" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-destructive text-destructive-foreground">
              <ul className="text-xs list-disc pl-3">
                {issues.map((issue, idx) => (
                  <li key={idx}>{issue.message}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <Menu
        items={[
          { label: "Editar fila", icon: "editar", action: onEdit },
          { label: "Eliminar fila", icon: "eliminar", action: onDelete, className: "text-error" },
        ]}
      />
    </div>
  );
}
