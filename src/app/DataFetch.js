'use client'
import { useQueries } from '@tanstack/react-query'

export default function DataFetch({ selectedInitURLs }) {
    console.log("render occurred! DataFetch")

    // const dataQueries = useQueries({
    //     queries: selectedInitURLs.map((initTimeURL) => {
    //       return {
    //         queryKey: [initTimeURL],
    //         queryFn: async () => {
        //          await fetch(initTimeURL),
                // }
    //       }
    //     }),
    //   })
}