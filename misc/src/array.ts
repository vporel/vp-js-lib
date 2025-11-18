
export function range(min: number, max: number): number[]{
    const array: number[] = []
    for(let i = min; i <= max; i++) array.push(i)
    return array
}