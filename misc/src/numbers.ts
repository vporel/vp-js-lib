
export function formatCurrency(number: number|string, currency = "EUR"){
    return new Intl.NumberFormat("fr-FR", {style: "currency", currency}).format(parseInt(number as string))
}

export function formatXAF(number: number|string){
    return formatCurrency(number, "XAF")
}