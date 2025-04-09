import {
	format,
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	addDays,
	isSameMonth,
	isSameDay,
	isToday,
} from "date-fns";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
	currentMonth: Date;
	selectedDate: Date | null;
	onSelectDate: (date: Date) => void;
}

export default function CalendarView({
	currentMonth,
	selectedDate,
	onSelectDate,
}: CalendarViewProps) {
	const renderHeader = () => {
		const dateFormat = "EEEEEE";
		const days = [];
		const startDate = startOfWeek(startOfMonth(currentMonth));

		for (let i = 0; i < 7; i++) {
			days.push(
				<div
					key={i}
					className="text-center text-xs font-medium text-gray-500 uppercase"
				>
					{format(addDays(startDate, i), dateFormat)}
				</div>,
			);
		}

		return <div className="grid grid-cols-7 mb-2">{days}</div>;
	};

	const renderDays = () => {
		const monthStart = startOfMonth(currentMonth);
		const monthEnd = endOfMonth(monthStart);
		const startDate = startOfWeek(monthStart);
		const endDate = endOfWeek(monthEnd);

		const rows = [];
		let days = [];
		let day = startDate;
		let formattedDate = "";

		while (day <= endDate) {
			for (let i = 0; i < 7; i++) {
				formattedDate = format(day, "d");
				const cloneDay = day;
				const isCurrentMonth = isSameMonth(day, monthStart);

				days.push(
					<div
						key={day.toString()}
						className={`relative p-1 text-center ${!isCurrentMonth ? "text-gray-300" : ""}`}
					>
						<Button
							variant="ghost"
							size="sm"
							className={`h-8 w-8 p-0 rounded-full ${isToday(day) ? "bg-gray-100" : ""} ${
								selectedDate && isSameDay(day, selectedDate)
									? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
									: ""
							} ${!isCurrentMonth ? "opacity-0 pointer-events-none" : ""}`}
							onClick={() => onSelectDate(cloneDay)}
							disabled={!isCurrentMonth}
						>
							{formattedDate}
						</Button>
					</div>,
				);
				day = addDays(day, 1);
			}

			rows.push(
				<div key={day.toString()} className="grid grid-cols-7 gap-1">
					{days}
				</div>,
			);
			days = [];
		}

		return <div className="space-y-1">{rows}</div>;
	};

	return (
		<div className="calendar">
			{renderHeader()}
			{renderDays()}
		</div>
	);
}
