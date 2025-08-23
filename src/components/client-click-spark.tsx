"use client";

import dynamic from 'next/dynamic'

const ClickSpark = dynamic(() => import('@/components/click-spark'), {
  ssr: false,
})

export default ClickSpark;
