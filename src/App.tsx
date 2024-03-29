import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FaFire } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { motion } from "framer-motion";

export default function App() {
	return (
		<div className="grid h-screen bg-neutral-900 text-neutral-50">
			<Board />
		</div>
	);
}

const Board = () => {
	const [cards, setCards] = useState<CardType[]>([]);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if(isLoaded) return;
		const prevData = localStorage.getItem('cards') as string;
		if(prevData != null) setCards(JSON.parse(prevData)); 

		setIsLoaded(true);
	}, [])

	useEffect(() => {
		if(isLoaded){
			localStorage.setItem('cards', JSON.stringify(cards));
		}
	}, [cards])

	if(!isLoaded) return null;

	return (
		<div className="flex justify-center w-full h-full overflow-auto p-12 gap-4">
			<Column
				title={"Backlog"}
				headingColor="text-neutral-500"
				column="backlog"
				cards={cards}
				setCards={setCards}
			/>
			<Column
				title={"Todo"}
				headingColor="text-yellow-200"
				column="todo"
				cards={cards}
				setCards={setCards}
			/>
			<Column
				title={"In Progress"}
				headingColor="text-blue-500"
				column="doing"
				cards={cards}
				setCards={setCards}
			/>
			<Column
				title={"Complete"}
				headingColor="text-emerald-500"
				column="done"
				cards={cards}
				setCards={setCards}
			/>
			<DeleteTodo setCards={setCards} />
		</div>
	);
};

interface ColumnProps {
	title: string;
	headingColor: string;
	column: string;
	cards: CardType[];
	setCards: Dispatch<SetStateAction<CardType[]>>;
}

const Column = ({
	title,
	headingColor,
	column,
	cards,
	setCards,
}: ColumnProps) => {
	const [active, setActive] = useState(false);

	const handleDragStart = (e: any, card: CardType) => {
		e?.dataTransfer.setData("cardId", card.id);
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		highlightIndicators(e);
		setActive(true);
	};

	const highlightIndicators = (e: React.DragEvent<HTMLDivElement>) => {
		const indicators = getIndicators();
        clearHighlights(indicators);
        const el = getNearestIndicator(e, indicators);
        el.style.opacity = "1";
	};

    const clearHighlights = (indicators?: NodeListOf<HTMLElement>) => {
        indicators = indicators || getIndicators();
        indicators.forEach(ind => {
            ind.style.opacity = "0";
        })
    }

	const getNearestIndicator = (e: React.DragEvent<HTMLDivElement>, nodes: NodeListOf<HTMLElement>) => {
        const { clientY } = e;
        let nearestIndicator: HTMLElement = document.createElement('div');
        let minDistance = Number.MAX_SAFE_INTEGER;
    
        nodes.forEach(indicator => {
            const indicatorRect = indicator.getBoundingClientRect();
            const distance = Math.abs(clientY - (indicatorRect.top + indicatorRect.height / 2));
    
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndicator = indicator;
            }
        });
    
        return nearestIndicator;
    }
    
	const getIndicators = () => {
		return document.querySelectorAll(`[data-column="${column}"]`) as NodeListOf<HTMLElement>;
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setActive(false);
        clearHighlights();
	};

	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		setActive(false);
        clearHighlights();

        const cardId = e.dataTransfer.getData('cardId');
        if(cardId){
            const indicators = getIndicators();
            const element = getNearestIndicator(e, indicators);
            const before = element.dataset.before || "-1";
            if(before !== cardId){
                let copy = [...cards];
                let cardToTransfer = copy.find((c) => c.id === cardId);
                if(!cardToTransfer) return;
                cardToTransfer = {...cardToTransfer, column};
                copy = copy.filter(c => c.id !== cardId);
                if(before === "-1"){
                    copy.push(cardToTransfer);
                }else{
                    const indexToInsert = copy.findIndex((el) => el.id === before);
                    if(!indexToInsert) return;
                    copy.splice(indexToInsert, 0, cardToTransfer);
                }
                setCards(copy);
            }
        }   
	};

	const filteredCards = cards.filter((card) => card.column === column);

	return (
		<div className="w-60 shrink-0">
			<div className="mb-3 flex items-center justify-between">
				<h3 className={`font-medium ${headingColor}`}>{title}</h3>
				<span className="rounded text-sm text-neutral-400">
					{filteredCards.length}
				</span>
			</div>
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDragEnd}
				className={`h-full w-full transition-colors ${
					active ? "bg-neutral-800/50" : "bg-neutral-800/0"
				}`}
			>
				{filteredCards.map((filteredCard) => (
					<Card
						key={filteredCard.id}
						{...filteredCard}
						handleDragStart={handleDragStart}
					/>
				))}
				<DropIndicator beforeId={"-1"} column={column} />
				<AddCard column={column} setCards={setCards} />
			</div>
		</div>
	);
};

const Card = ({
	title,
	id,
	column,
	handleDragStart,
}: {
	title: string;
	id: string;
	column: string;
	handleDragStart: (e: any, card: CardType) => void;
}) => {
	return (
		<>
			<DropIndicator beforeId={id} column={column} />
			<motion.div
				layout
				layoutId={id}
				draggable="true"
				onDragStart={(e) => handleDragStart(e, { title, id, column })}
				className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
			>
				<p className="text-sm text-neutral-100">{title}</p>
			</motion.div>
		</>
	);
};

const AddCard = ({
	column,
	setCards,
}: {
	column: string;
	setCards: Dispatch<SetStateAction<CardType[]>>;
}) => {
	const [text, setText] = useState("");
	const [adding, setAdding] = useState(false);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (text.trim().length === 0) return;
		const newCard = {
			title: text,
			id: Math.random.toString(),
			column,
		};
		setCards((prev) => [...prev, newCard]);
		setAdding(false);
	};
	return (
		<>
			{adding ? (
				<motion.form layout onSubmit={(e) => handleSubmit(e)}>
					<textarea
						onChange={(e) => setText(e.target.value)}
						autoFocus
						placeholder="Add new task..."
						className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-neutral-50 focus:outline-0 placeholder-violet-300"
					></textarea>
					<div className="mt-1.5 flex items-center justify-end gap-1.5 font-medium">
						<button
							type="button"
							onClick={() => setAdding(false)}
							className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
						>
							Close
						</button>
						<button
							type="submit"
							className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-50 text-neutral-950 transition-colors hover:text-neutral-500"
						>
							<span>Add </span>
							<FiPlus />
						</button>
					</div>
				</motion.form>
			) : (
				<motion.button
					layout
					className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
					onClick={() => setAdding(true)}
				>
					<span>Add card</span>
					<FiPlus />
				</motion.button>
			)}
		</>
	);
};

const DropIndicator = ({
	beforeId,
	column,
}: {
	beforeId: string;
	column: string;
}) => {
	return (
		<div
			data-before={beforeId}
			data-column={column}
			className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
		/>
	);
};

const DeleteTodo = ({
	setCards,
}: {
	setCards: Dispatch<SetStateAction<CardType[]>>;
}) => {
	const [active, setActive] = useState(false);
	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setActive(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		setActive(false);
	};

	const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
		const id = e.dataTransfer.getData("cardId");
		if (!id) return;
		setCards((prev) => prev.filter((card) => card.id !== id));
		setActive(false);
	};

	return (
		<div
			onDrop={(e) => handleDragEnd(e)}
			onDragOver={(e) => handleDragOver(e)}
			onDragLeave={(e) => handleDragLeave(e)}
			className={`mt-10 grid h-56 w-60 shrink-0 place-content-center rounded border text-3xl ${
				active
					? "border-red-800 bg-red-800/20 text-red-500"
					: "border-neutral-500 bg-neutral-500/20 text-neutral-500"
			}`}
		>
			{active ? (
				<FaFire className="animate-bounce pointer-events-none" />
			) : (
				<FaTrash />
			)}
		</div>
	);
};

interface CardType {
	title: string;
	id: string;
	column: string;
}

const DEFAULT_DATA = [
	{
		title: "Complete Quiz App",
		id: "1",
		column: "done",
	},
	{
		title: "Complete drag and drop",
		id: "2",
		column: "doing",
	},
	{
		title: "Vs code extension for Auto semicolon",
		id: "3",
		column: "doing",
	},
	{
		title: "Add project in Portfolio site",
		id: "4",
		column: "done",
	},
	{
		title: "Study aptitude",
		id: "5",
		column: "backlog",
	},
	{
		title: "Complete Quiz App",
		id: "6",
		column: "done",
	},
	{
		title: "Complete drag and drop",
		id: "7",
		column: "todo",
	},
	{
		title: "Vs code extension for Auto semicolon",
		id: "8",
		column: "todo",
	},
	{
		title: "Add project in Portfolio site",
		id: "9",
		column: "done",
	},
	{
		title: "Study aptitude",
		id: "10",
		column: "backlog",
	},
];
