'use client'

import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { toast } from 'react-hot-toast'
import dynamic from 'next/dynamic'
import { z } from 'zod'
import { Tooltip } from 'react-tooltip'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const TokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  symbol: z.string(),
  image: z.string().url(),
  summary: z.string(),
  price: z.number().optional(),
  market_cap: z.number().optional(),
  price_change_24h: z.number().optional(),
  volume_24h: z.number().optional(),
  circulating_supply: z.number().optional(),
  sentiment: z.enum(['bullish', 'bearish', 'neutral', 'strong bullish', 'strong bearish'])
})

type TokenInfo = z.infer<typeof TokenSchema>

export default function Home() {
  const [tokens, setTokens] = useState<string[]>([''])
  const [results, setResults] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const savedDark = localStorage.getItem('cryptoAgentDarkMode')
    setDark(savedDark ? JSON.parse(savedDark) : false)
  }, [])

  useEffect(() => {
    localStorage.setItem('cryptoAgentDarkMode', JSON.stringify(dark))
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResults([])
    toast.dismiss()

    try {
      const validTokens = tokens.filter(t => t.trim())
      if (!validTokens.length) {
        toast.error('Please enter at least one token')
        return
      }

      const results = await Promise.allSettled(
        validTokens.map(token => 
          fetch(`/api/research?token=${token.toLowerCase()}`)
            .then(res => {
              if (!res.ok) throw new Error('API request failed')
              return res.json()
            })
            .then(data => TokenSchema.parse(data))
        )
      )
      
      const successfulResults = results
        .filter((r): r is PromiseFulfilledResult<TokenInfo> => r.status === 'fulfilled')
        .map(r => r.value)

      const failedCount = results.filter(r => r.status === 'rejected').length
      if (failedCount > 0) {
        toast.error(`Failed to fetch ${failedCount} token${failedCount > 1 ? 's' : ''}`)
      }

      setResults(successfulResults)
    } catch (err) {
      console.error('Submission error:', err)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleTokenChange = (index: number, value: string) => {
    const updated = [...tokens]
    updated[index] = value
    setTokens(updated)
  }

  const addTokenField = () => {
    setTokens([...tokens, ''])
  }

  const removeTokenField = (index: number) => {
    if (tokens.length > 1) {
      const updated = tokens.filter((_, i) => i !== index)
      setTokens(updated)
    }
  }

  return (
    <main className={`${dark ? 'dark' : ''} min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-20`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 -z-10 opacity-10 dark:opacity-5 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px]"></div>

        {/* Header */}
        <header className="mb-12 text-center">
  <div className="flex justify-end mb-2">
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      ) : (
        <MoonIcon className="w-5 h-5 text-gray-600" />
      )}
    </button>
  </div>

  <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
    Your AI Crypto Research Dashboard
  </h1>

  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
    Analyze market sentiment, key metrics, and performance trends across any crypto token — instantly.
  </p>

  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500 max-w-xl mx-auto">
    Get investor-grade insights on price movement, market cap, volume, and real-time sentiment — all in one sleek dashboard.
  </p>
</header>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto mb-16">
          <div className="space-y-3">
            {tokens.map((token, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="relative flex-1">
                <input
  type="text"
  value={token}
  onChange={(e) => handleTokenChange(idx, e.target.value)}
  placeholder={`e.g. BTC, ETH, BNB or full name like Bitcoin`}
  className="w-full p-4 pl-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
  list="common-tokens"
  autoComplete="off"
/>

                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon className="w-5 h-5" />
                  </div>
                </div>
                {idx === tokens.length - 1 ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addTokenField}
                      className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
                      aria-label="Add token"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                    {tokens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTokenField(idx)}
                        className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
                        aria-label="Remove token"
                      >
                        <MinusIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeTokenField(idx)}
                    className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
                    aria-label="Remove token"
                  >
                    <MinusIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <datalist id="common-tokens">
            <option value="BTC" />
            <option value="ETH" />
            <option value="BNB" />
            <option value="XRP" />
            <option value="ADA" />
            <option value="SOL" />
            <option value="DOT" />
            <option value="DOGE" />
          </datalist>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
         {loading ? (
  <span className="flex items-center justify-center gap-2">
    <Spinner />
    Analyzing tokens...
  </span>
) : (
  'Start Analyzing'
)}

          </button>
        </form>

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <div className="mx-auto max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 text-gray-400 dark:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Enter at least one cryptocurrency symbol or name to generate a report
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && <SkeletonLoader count={tokens.length} dark={dark} />}

        {/* Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {results.map((token, index) => (
                <TokenCard 
                  key={token.id} 
                  token={token} 
                  dark={dark}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                />
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">Market Comparison</h2>
                <p className="text-gray-600 dark:text-gray-400">Visualized price performance</p>
              </div>
              <div className="p-6">
                <Chart
                  options={{
                    chart: {
                      type: 'line',
                      height: 350,
                      foreColor: dark ? '#fff' : '#000',
                      toolbar: {
                        show: true,
                        tools: {
                          download: true,
                          selection: true,
                          zoom: true,
                          zoomin: true,
                          zoomout: true,
                          pan: true,
                          reset: true
                        }
                      }
                    },
                    theme: {
                      mode: dark ? 'dark' : 'light'
                    },
                    stroke: {
                      width: 3,
                      curve: 'smooth'
                    },
                    markers: {
                      size: 5
                    },
                    grid: {
                      borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                      strokeDashArray: 4,
                    },
                    xaxis: {
                      categories: results.map(t => t.symbol)
                    },
                    yaxis: {
                      labels: {
                        formatter: (value) => `$${value.toLocaleString()}`
                      }
                    },
                    tooltip: {
                      enabled: true,
                      theme: dark ? 'dark' : 'light',
                      y: {
                        formatter: (value) => `$${value.toLocaleString()}`
                      }
                    }
                  }}
                  series={[{
                    name: 'Price (USD)',
                    data: results.map(t => t.price || 0)
                  }]}
                  type="line"
                  height={350}
                />
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">Detailed Comparison</h2>
                <p className="text-gray-600 dark:text-gray-400">Key metrics side-by-side</p>
              </div>
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Metric</th>
                      {results.map(token => (
                        <th key={token.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {token.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    <TableRow label="Price" values={results.map(t => t.price)} isCurrency />
                    <TableRow label="24h Change" values={results.map(t => t.price_change_24h)} isPercentage />
                    <TableRow label="Market Cap" values={results.map(t => t.market_cap)} isCurrency />
                    <TableRow label="Volume (24h)" values={results.map(t => t.volume_24h)} isCurrency />
                    <TableRow label="Circulating Supply" values={results.map(t => t.circulating_supply)} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

const TokenCard = ({ token, className = '', ...props }: { 
  token: TokenInfo, 
  dark: boolean,
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) => {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl border border-gray-100 dark:border-gray-700 ${className}`}
      {...props}
    >
      {/* Card Header with gradient */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 opacity-10"></div>
            <img 
              src={token.image} 
              alt={token.symbol} 
              className="relative w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 p-1 z-0"
              onError={(e) => (e.currentTarget.src = '/crypto-fallback.svg')}
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${
              token.sentiment === 'bullish' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {token.sentiment === 'bullish' ? (
                <TrendingUpIcon className="w-3 h-3 text-white" />
              ) : (
                <TrendingDownIcon className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-balance">{token.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{token.symbol}</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatItem label="Price" value={token.price} isCurrency />
          <StatItem label="24h Change" value={token.price_change_24h} isPercentage />
          <StatItem label="Market Cap" value={token.market_cap} isCurrency />
          <StatItem label="Volume (24h)" value={token.volume_24h} isCurrency />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Market Sentiment</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              token.sentiment === 'bullish' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              {token.sentiment.charAt(0).toUpperCase() + token.sentiment.slice(1)}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                token.sentiment === 'bullish' ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: token.sentiment === 'bullish' ? '75%' : '25%' }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg flex items-center justify-between transition-colors"
        >
          <span className="font-medium">Technical Analysis</span>
          <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {expanded && (
          <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{token.summary}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

const StatItem = ({ label, value, isCurrency, isPercentage }: { 
  label: string
  value?: number
  isCurrency?: boolean
  isPercentage?: boolean
}) => (
  <div className="relative group">
    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
      {label}
      <button 
        data-tooltip-id={`tooltip-${label}`}
        className="ml-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
      >
        <InformationCircleIcon className="w-4 h-4" />
      </button>
    </div>
    <Tooltip 
      id={`tooltip-${label}`} 
      place="top"
      className="z-50 !bg-gray-800 !text-white !opacity-100 !max-w-xs"
    >
      {label === 'Price' && 'Current market price in USD'}
      {label === '24h Change' && 'Percentage change over last 24 hours'}
      {label === 'Market Cap' && 'Total market value of circulating supply'}
      {label === 'Volume (24h)' && 'Trading volume over last 24 hours'}
    </Tooltip>
    <div className={`text-lg font-semibold ${
      typeof value === 'number' ? 
        value < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400' 
        : 'text-gray-900 dark:text-gray-200'
    }`}>
      {typeof value === 'number' ? (
        <>
          {isCurrency && '$'}
          {value < 0.01 && value > 0 ? value.toFixed(8) :
          (isCurrency ? value.toLocaleString(undefined, { 
            maximumFractionDigits: value < 1 ? 6 : 2 
          }) : value.toFixed(2))}
          {isPercentage && '%'}
        </>
      ) : 'N/A'}
    </div>
  </div>
)

const TableRow = ({ label, values, isCurrency, isPercentage }: { 
  label: string
  values: (number | undefined)[]
  isCurrency?: boolean
  isPercentage?: boolean
}) => (
  <tr>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">
      {label}
    </td>
    {values.map((value, i) => (
      <td key={i} className={`px-6 py-4 whitespace-nowrap text-sm ${
        typeof value === 'number' ? 
          value < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400' 
          : 'text-gray-500 dark:text-gray-400'
      }`}>
        {typeof value === 'number' ? (
          <>
            {isCurrency && '$'}
            {value.toLocaleString(undefined, { 
              maximumFractionDigits: isCurrency ? 2 : 4 
            })}
            {isPercentage && '%'}
          </>
        ) : 'N/A'}
      </td>
    ))}
  </tr>
)

const SkeletonLoader = ({ count, dark }: { count: number, dark: boolean }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {[...Array(count)].map((_, i) => (
      <div 
        key={i} 
        className={`rounded-xl shadow-lg overflow-hidden ${
          dark ? 'bg-gray-800' : 'bg-white'
        } animate-pulse`}
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className="space-y-2 flex-1">
              <div className={`h-5 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '60%' }} />
              <div className={`h-3 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '40%' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className={`h-4 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '60%' }} />
                <div className={`h-6 rounded ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} style={{ width: '80%' }} />
              </div>
            ))}
          </div>
          <div className={`h-10 rounded-lg ${dark ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    ))}
  </div>
)

// Icons
const SearchIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
)

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const MinusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
)

const MoonIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

const SunIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
)

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
)

const InformationCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const Spinner = () => (
  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
)