import React from "react";
import { IconType } from "react-icons";
import { SiGoogle } from "react-icons/si";
import { useAnimate } from "framer-motion";

export default function HoverAnimationStripe() {
	return (
		<div className="min-h-screen bg-neutral-50 px-4 py-12">
			<div className="mx-auto max-w-7xl">
				<Container />
			</div>
		</div>
	);
}

const Container = () => {
	return (
		<div className="border border-neutral-900 divide-y divide-neutral-900">
			<div className="grid grid-cols-2 divide-x divide-neutral-900">
				<Clippy Icon={SiGoogle} href="#" />
				<Clippy Icon={SiGoogle} href="#" />
			</div>
			<div className="grid grid-cols-4 divide-x divide-neutral-900">
				<Clippy Icon={SiGoogle} href="#" />
				<Clippy Icon={SiGoogle} href="#" />
				<Clippy Icon={SiGoogle} href="#" />
				<Clippy Icon={SiGoogle} href="#" />
			</div>
			<div className="grid grid-cols-3 divide-x divide-neutral-900">
				<Clippy Icon={SiGoogle} href="#" />
				<Clippy Icon={SiGoogle} href="#" />
				<Clippy Icon={SiGoogle} href="#" />
			</div>
		</div>
	);
};

const NO_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0% 100%)";
const BOTTOM_RIGHT_CLIP = "polygon(0 0, 100% 0, 0 0, 0% 100%)";
const TOP_RIGHT_CLIP = "polygon(0 0, 0 100%, 100% 100%, 0 100%)";
const BOTTOM_LEFT_CLIP = "polygon(100% 100%, 100% 0, 100% 100%, 0 100%)";
const TOP_LEFT_CLIP = "polygon(0 0, 100% 0, 100% 100%, 100% 0)";

const ENTRANCE_ANIMATION = {
	left: [BOTTOM_RIGHT_CLIP, NO_CLIP],
	bottom: [BOTTOM_RIGHT_CLIP, NO_CLIP],
	top: [BOTTOM_RIGHT_CLIP, NO_CLIP],
	right: [TOP_LEFT_CLIP, NO_CLIP],
};

const EXIT_ANIMATION = {
	left: [NO_CLIP, TOP_RIGHT_CLIP],
	bottom: [NO_CLIP, TOP_RIGHT_CLIP],
	top: [NO_CLIP, TOP_RIGHT_CLIP],
	right: [NO_CLIP, BOTTOM_LEFT_CLIP],
};

const Clippy = ({ Icon, href }: { Icon: IconType; href: string }) => {
	const [scope, animate] = useAnimate();
	const handleMouseEnter = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
	) => {
		const side = getNearestSide(e) as "left" | "bottom" | "top" | "right";;
		const entranceAnimation = ENTRANCE_ANIMATION[side];
		if(entranceAnimation){
			animate(scope.current, {
				clipPath: entranceAnimation,
			});
		}
	};

	const handleMouseLeave = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
	) => {
		const side = getNearestSide(e) as "left" | "bottom" | "top" | "right";;
		const exitAnimation = EXIT_ANIMATION[side];
		if(exitAnimation){
			animate(scope.current, {
				clipPath: exitAnimation,
			});
		}
	};

	const getNearestSide = (
		e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
	): string => {
		const boundary = (e.target as HTMLElement)?.getBoundingClientRect();
		const clientX = e.clientX;
		const clientY = e.clientY;
		const leftDist = {
			dist: Math.abs(boundary.left - clientX),
			side: "left"
		}
		const rightDist = {
			dist: Math.abs(boundary.right - clientX),
			side: "right"
		}
		const topDist = {
			dist: Math.abs(boundary.top - clientY),
			side: "top"
		}
		const bottomDist = {
			dist: Math.abs(boundary.bottom - clientY),
			side: "bottom"
		}
		const sortedSides = [leftDist, rightDist, topDist, bottomDist].sort((a, b) => a.dist - b.dist);
		return sortedSides[0].side;
	};

	return (
		<a
			onMouseEnter={(e) => handleMouseEnter(e)}
			onMouseLeave={(e) => handleMouseLeave(e)}
			href={href}
			className="relative box-border grid place-content-center h-20 md:h-28 lg:h-36"
		>
			<Icon className="text-sm md:text-3xl lg:text-4xl" />
			<div
				ref={scope}
				style={{ clipPath: "polygon(0 0, 100% 0, 0 0, 0 100%)" }}
				className="absolute inset-0 grid place-content-center bg-neutral-900 "
			>
				<Icon className="text-sm md:text-3xl lg:text-4xl text-white" />
			</div>
		</a>
	);
};
