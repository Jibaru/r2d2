interface ProgressBarProps {
	currentTime: number;
	duration: number;
}

export function ProgressBar({ currentTime, duration }: ProgressBarProps) {
	const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, "0")}`;
	};

	return (
		<div className="flex items-center gap-2 text-sm">
			<span className="text-foreground opacity-70">
				{formatTime(currentTime)}
			</span>

			<div className="h-2 flex-1 overflow-hidden rounded-full bg-foreground bg-opacity-20">
				<div
					className="h-full bg-foreground transition-all duration-300 ease-out"
					style={{ width: `${progress}%` }}
				/>
			</div>

			<span className="text-foreground opacity-70">{formatTime(duration)}</span>
		</div>
	);
}
