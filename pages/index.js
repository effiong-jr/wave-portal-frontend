import Head from 'next/head'
import { BsEmojiSmile } from 'react-icons/bs'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-gray-800 text-gray-50">
      <Head>
        <title>Wave Portal</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="text-center">
        <h1 className="font-semibold text-xl mb-3">
          Hi! I'm{' '}
          <span>
            <a href="https://twitter.com/fyoung_jr" className="text-blue-600">
              @fyoung_jr
            </a>

            <BsEmojiSmile className="text-yellow-600 inline-block ml-2" />
          </span>
        </h1>
        <p>Welcome to my wave portal</p>
      </main>
    </div>
  )
}
