// Simple in-memory lock to ensure sequential compose calls
class ComposeLock {
	private isLocked = false;
	private queue: Array<() => void> = [];

	async acquire(): Promise<void> {
		return new Promise((resolve) => {
			if (!this.isLocked) {
				this.isLocked = true;
				resolve();
			} else {
				this.queue.push(resolve);
			}
		});
	}

	release(): void {
		this.isLocked = false;
		const next = this.queue.shift();
		if (next) {
			this.isLocked = true;
			next();
		}
	}
}

export const composeLock = new ComposeLock();
