export function ReservationSuccessPulseAtom() {
	return (
		<div className="relative flex size-20 items-center justify-center">
			<div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
			<div className="relative flex size-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
				OK
			</div>
		</div>
	);
}
