"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import QRCode from 'qrcode'
import { useState } from 'react';

const formSchema = z.object({
  startValue: z.coerce.number(),
  asnPrefix: z.string(),
  separatorString: z.string()
})


export default function CardMaker() {
  type cardList = {
    asnCode: string
    separatorCode: string
    asnValue: string
  }

  const [cards, setCards] = useState<cardList[]>([])
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startValue: 1,
      asnPrefix: "ASN",
      separatorString: "PATCHT"
    },
  })

  function padNumber(number: number, length: number): string {
    let stringedNumber = number + ""
    while (stringedNumber.length < length) stringedNumber = `0${stringedNumber}`
    return stringedNumber
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const cardData: cardList[] = []
    for (let i = values.startValue; i < values.startValue + 5 * 10; i++){
      const padded: string = padNumber(i, 9 - values.asnPrefix.length)
      const asnValue: string = `${values.asnPrefix}${padded}`
      cardData.push({
        asnCode: await QRCode.toDataURL(asnValue, {margin: 1}),
        asnValue: asnValue,
        separatorCode: await QRCode.toDataURL(values.separatorString, {margin: 1})
      })
    }
    setCards(cardData)
    console.debug(cards)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 w-full">
      {/* Input fields */}
      <div className="print:hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              name={"startValue"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Value</FormLabel>
                  <FormControl>
                    <Input placeholder="1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name={"asnPrefix"}
              control={form.control}
              render={({field}) => (
              <FormItem>
                  <FormLabel>ASN Prefix</FormLabel>
                  <FormControl>
                    <Input placeholder="Default is ASN" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              name={"separatorString"}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Separator String</FormLabel>
                  <FormControl>
                    <Input placeholder="Default is PATCHT" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
             />
            <Button type="submit"> Submit</Button>
        </form>
      </Form>
    </div>

    <div id={"output"} className="print mt-10 grid grid-cols-5 grid-rows-10">
      {
        cards.map((value) =>
            <div className="m-1 border-2 border-black h-fit w-fit px-2">
              <div className="flex flex-row justify-center mt-1 ">
                <img src={value.asnCode} width="70mm" height="70mm" alt="ASN QR Code"/>
                <img src={value.separatorCode} width="70mm" height="70mm" alt="Separator QR Code"/>
              </div>
              <p className="w-full text-center">{value.asnValue}</p>
            </div>
        )
      }
    </div>
  </main>
)
  ;
}
