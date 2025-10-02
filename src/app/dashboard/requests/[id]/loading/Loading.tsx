"use client";

import ProgressLoading from "@/components/blocks/ProgressLoading";

type Props = {
  duration: number;
};

export default function Loading({ duration }: Props) {
  return <ProgressLoading duration={duration} text="Loading your request..." />;
}
