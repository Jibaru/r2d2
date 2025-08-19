import { Button } from "@/components/ui/button";

interface PlayerControlsProps {
	isPlaying: boolean;
	onPlay: () => void;
	onPause: () => void;
	onNext: () => void;
	onPrevious: () => void;
	disabled?: boolean;
}

export function PlayerControls({
	isPlaying,
	onPlay,
	onPause,
	onNext,
	onPrevious,
	disabled = false,
}: PlayerControlsProps) {
	return (
		<div className="flex items-center gap-2">
			<Button
				variant="ghost"
				size="sm"
				onClick={onPrevious}
				disabled={disabled}
				aria-label="Previous track"
			>
				⏮
			</Button>

			<Button
				variant="default"
				onClick={isPlaying ? onPause : onPlay}
				disabled={disabled}
				aria-label={isPlaying ? "Pause" : "Play"}
			>
				{isPlaying ? "⏸" : "▶"}
			</Button>

			<Button
				variant="ghost"
				size="sm"
				onClick={onNext}
				disabled={disabled}
				aria-label="Next track"
			>
				⏭
			</Button>
		</div>
	);
}
