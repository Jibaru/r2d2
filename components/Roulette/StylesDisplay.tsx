import { Badge } from "@/components/ui/badge";

interface StylesDisplayProps {
	styles: string[];
	title: string;
}

export function StylesDisplay({ styles, title }: StylesDisplayProps) {
	if (styles.length === 0) return null;

	return (
		<div className="space-y-3">
			<h4 className="font-medium">{title}</h4>
			<div className="flex flex-wrap gap-2">
				{styles.map((style) => (
					<Badge key={style} variant="outline">
						{style}
					</Badge>
				))}
			</div>
		</div>
	);
}
