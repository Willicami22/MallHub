import { ReservationDatePickerMolecule } from '@/features/reservations/molecules/reservation-date-picker.molecule';
import { ReservationTimePickerMolecule } from '@/features/reservations/molecules/reservation-time-picker.molecule';

type DateOption = {
	value: string;
	label: string;
	disabled?: boolean;
};

type TimeOption = {
	value: string;
	label: string;
};

export function ReservationPickupDateTimeOrganism({
	dateLabel,
	dateDescription,
	dateUnavailableMessage,
	dateOptions,
	dateValue,
	timeLabel,
	timeDescription,
	timePlaceholder,
	timeUnavailableMessage,
	timeOptions,
	timeValue,
	onDateChange,
	onTimeChange,
}: {
	dateLabel: string;
	dateDescription: string;
	dateUnavailableMessage: string;
	dateOptions: DateOption[];
	dateValue: string;
	timeLabel: string;
	timeDescription: string;
	timePlaceholder: string;
	timeUnavailableMessage: string;
	timeOptions: TimeOption[];
	timeValue: string;
	onDateChange: (nextValue: string) => void;
	onTimeChange: (nextValue: string) => void;
}) {
	return (
		<div className="space-y-4">
			<ReservationDatePickerMolecule
				label={dateLabel}
				description={dateDescription}
				options={dateOptions}
				selectedValue={dateValue}
				unavailableMessage={dateUnavailableMessage}
				onDateChange={onDateChange}
			/>
			<ReservationTimePickerMolecule
				label={timeLabel}
				description={timeDescription}
				placeholder={timePlaceholder}
				unavailableMessage={timeUnavailableMessage}
				options={timeOptions}
				value={timeValue}
				onTimeChange={onTimeChange}
			/>
		</div>
	);
}
