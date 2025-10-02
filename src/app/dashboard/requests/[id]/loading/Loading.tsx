"use client";

import ProgressLoading from "@/components/blocks/ProgressLoading";

type Props = {
  duration: number;
};

export default function Loading({}: Props) {
  return <ProgressLoading />;
}
