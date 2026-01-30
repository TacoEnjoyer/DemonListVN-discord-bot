export const formatTime = (ms: number) => {
	const minutes = Math.floor(ms / 60000);
	const seconds = Math.floor((ms % 60000) / 1000);
	const milliseconds = ms % 1000;
	return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds
		.toString()
		.padStart(3, '0')}`;
};
