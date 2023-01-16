export interface ContextQuery {
    reply: (text: string) => void,
    from: { id: number },
    callbackQuery: { data: string }
}