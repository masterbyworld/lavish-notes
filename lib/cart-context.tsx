'use client'

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'velvaroma:cart'

export type CartItem = {
  id: string
  slug: string
  name: string
  image: string
  size: string
  price: number
  quantity: number
  // SKU routing: whiteSku is what the shopper browses; blackSku is the real
  // backend product it is substituted with at checkout.
  whiteSku: string
  blackSku: string
}

type State = { items: CartItem[] }

type Action =
  | { type: 'ADD'; item: Omit<CartItem, 'quantity'>; quantity: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'SET_QTY'; id: string; quantity: number }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { items: action.items }
    case 'ADD': {
      const existing = state.items.find((i) => i.id === action.item.id)
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id
              ? { ...i, quantity: Math.min(i.quantity + action.quantity, 20) }
              : i,
          ),
        }
      }
      return {
        items: [...state.items, { ...action.item, quantity: action.quantity }],
      }
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) }
    case 'SET_QTY':
      return {
        items: state.items.map((i) =>
          i.id === action.id
            ? { ...i, quantity: Math.max(1, Math.min(action.quantity, 20)) }
            : i,
        ),
      }
    case 'CLEAR':
      return { items: [] }
    default:
      return state
  }
}

// Buy 2 Get 1 Free — for every group of 3 units the cheapest is free.
function computeDeal(items: CartItem[]) {
  const units: number[] = []
  for (const i of items) for (let n = 0; n < i.quantity; n++) units.push(i.price)
  units.sort((a, b) => a - b)
  const freeCount = Math.floor(units.length / 3)
  let discount = 0
  for (let n = 0; n < freeCount; n++) discount += units[n]
  return { freeCount, discount }
}

type CartContextValue = {
  items: CartItem[]
  count: number
  rawSubtotal: number
  discount: number
  subtotal: number
  freeCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  setQuantity: (id: string, quantity: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [] })
  const [isOpen, setIsOpen] = useState(false)
  // Start false so the server render and the first client render agree (empty
  // cart). We only read localStorage after mount, then persist on later changes,
  // which avoids a hydration mismatch on the cart badge.
  const [hydrated, setHydrated] = useState(false)

  // Load any persisted cart once, after the initial (matching) client render.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      if (Array.isArray(parsed?.items) && parsed.items.length > 0) {
        dispatch({ type: 'HYDRATE', items: parsed.items })
      }
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true)
  }, [])

  // Persist the cart so items survive navigation (e.g. product page -> checkout).
  // Skip the pre-hydration render so we don't clobber storage with an empty cart.
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: state.items }))
    } catch {
      // storage may be unavailable (private mode) — cart still works in-memory
    }
  }, [state.items, hydrated])

  const value = useMemo<CartContextValue>(() => {
    const count = state.items.reduce((n, i) => n + i.quantity, 0)
    const rawSubtotal = state.items.reduce((n, i) => n + i.price * i.quantity, 0)
    const { freeCount, discount } = computeDeal(state.items)
    return {
      items: state.items,
      count,
      rawSubtotal,
      discount,
      subtotal: rawSubtotal - discount,
      freeCount,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem: (item, quantity = 1) => {
        dispatch({ type: 'ADD', item, quantity })
        setIsOpen(true)
      },
      removeItem: (id) => dispatch({ type: 'REMOVE', id }),
      setQuantity: (id, quantity) => dispatch({ type: 'SET_QTY', id, quantity }),
      clear: () => dispatch({ type: 'CLEAR' }),
    }
  }, [state.items, isOpen])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
