import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import abi from '../utils/wavePortal.json'

import Head from 'next/head'
import { BsEmojiSmile } from 'react-icons/bs'

export default function Home() {
  const [currentAccount, setCurrentAccount] = useState('')
  const [totalWaves, setTotalWaves] = useState(0)
  const [allWaves, setAllWaves] = useState([])
  const [isMining, setIsMining] = useState(false)
  const [userMessage, setUserMessage] = useState('')

  const contractAddress = '0xD4fDab09BF801A52f12B93D333fD9dB7F19d3E76'
  const contractABI = abi.abi

  useEffect(() => {
    checkIfWalletIsConnected()
    checkIfWalletIsConnected() && getAllWaves()
  }, [])

  useEffect(() => {
    let wavePortalContract

    const onNewWave = (from, timestamp, message) => {
      console.log('New wave', from, timestamp, message)

      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message,
        },
      ])
    }

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      )
      wavePortalContract.on('NewWave', onNewWave)
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off('NewWave', onNewWave)
      }
    }
  }, [])

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window

    if (!ethereum) {
      console.log('Make sure you have metamask installed')
      return
    } else {
      console.log('We have the ethereum object: ', ethereum)
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    try {
      if (accounts.length !== 0) {
        const account = accounts[0]
        console.log('Found an authorized account: ', account)
        setCurrentAccount(account)
      } else {
        console.log('No authorized account found')
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Implement a connectable wallet here

  const connectWallet = async () => {
    try {
      const { ethereum } = window

      if (!ethereum) {
        alert('Get MetaMask')
        return
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

      console.log(accounts[0])
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total wave count...', parseInt(count))
        setTotalWaves(parseInt(count))
        getAllWaves()

        //Executing a wave transaction
        const waveTxn = await wavePortalContract.wave(userMessage, {
          gasLimit: 300000,
        })
        console.log('Mining...', waveTxn.hash)
        setIsMining(true)

        await waveTxn.wait()
        console.log('Mined ---', waveTxn.hash)
        setIsMining(false)
        setUserMessage('')

        count = await wavePortalContract.getTotalWaves()
        console.log('Retrieved total waves: ', parseInt(count))
        setTotalWaves(parseInt(count))
      } else {
        console.log('Ethereum object does not exist')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()

        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const waves = await wavePortalContract.getAllWaves()
        const totalWaves = await wavePortalContract.getTotalWaves()

        setTotalWaves(parseInt(totalWaves))

        let wavesCleaned = []

        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            message: wave.message,
            timestamp: new Date(wave.timestamp * 1000),
          })
        })

        setAllWaves(wavesCleaned)
      } else {
        console.log('Ethereum object not found')
      }
    } catch (error) {
      console.log(error)
    }
  }

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
        <p>Send a &#128075; and stand a chance to win some ETH</p>
        <p className="mt-4 text-yellow-600">
          Total Waves: <span className="text-white">{totalWaves}</span>
        </p>
        <div className="mt-4">
          <div>
            <input
              type="text"
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your message here..."
              className="mb-4 h-10 w-96 rounded-md px-2 text-gray-800 outline-none"
            />
          </div>
          <button
            className="border-2 px-4 py-1 mr-4 rounded-md 
            hover:bg-gray-50 hover:text-gray-800 transition duration-300 
            disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            onClick={wave}
            disabled={isMining || userMessage.length === 0}
          >
            {isMining ? 'Sending Wave...' : 'Wave at me'}
          </button>

          {!currentAccount && (
            <button
              className="border-2 px-4 py-1 bg-red-400 rounded-md hover:bg-red-600  transition duration-300"
              onClick={connectWallet}
            >
              Connect wallet
            </button>
          )}
        </div>

        {/* Display all Waves */}
        <div className="mt-7">
          <h4 className="font-semibold">All my waves...</h4>
          {allWaves
            .map((wave) => (
              <div key={wave.timestamp} className="mt-5">
                <h2 className="font-semibold text-yellow-600 text-xl">
                  {wave.message}
                </h2>
                <div className="text-xs">
                  <p>
                    <span className="text-gray-400">From:</span> {wave.address}
                  </p>
                  <p>
                    <span className="text-gray-400">Time:</span>{' '}
                    {wave.timestamp.toUTCString()}
                  </p>
                </div>
              </div>
            ))
            .reverse()}
        </div>
      </main>
    </div>
  )
}
