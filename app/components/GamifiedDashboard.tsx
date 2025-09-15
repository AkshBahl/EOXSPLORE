"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Trophy, 
  Star, 
  Target, 
  BookOpen, 
  Play, 
  Lock, 
  CheckCircle, 
  TrendingUp,
  Award,
  Flame,
  Crown,
  Sparkles,
  ArrowRight,
  Clock,
  Users,
  BarChart3,
  Medal,
  RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useGamification, XP_CONFIG } from "../context/GamificationContext"
import { cloudinaryConfig, getCloudinaryUrl } from "../cloudinary-config"
import { useAuth } from "../context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { getAllModuleVideoOrders } from "../firestore-utils"
import { auth, db } from "@/firebase"

import ChallengeMode from "./ChallengeMode"
import { PieChart, Pie, Cell, Label, Tooltip, ResponsiveContainer } from "recharts"

interface Video {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  thumbnail?: string
  publicId?: string
  videoUrl?: string
  duration: string
  category: string
  tags?: string[]
  createdAt: any
  watched?: boolean
  company?: string
}

interface Module {
  name: string
  category: string
  totalDuration: string
  videos: Video[]
}

export default function GamifiedDashboard() {
  const router = useRouter()
  const { userProgress, loading, getCurrentLevel, getXPToNextLevel, getLevelProgress } = useGamification()
  const { userData } = useAuth()
  const [showConfetti, setShowConfetti] = useState(false)
  const [dailyReminder, setDailyReminder] = useState("")
  const [moduleSuggestions, setModuleSuggestions] = useState<any[]>([])
  const [topVideos, setTopVideos] = useState<Video[]>([])
  const [videoProgress, setVideoProgress] = useState<{[key: string]: number}>({})
  const [allVideos, setAllVideos] = useState<Video[]>([])
  const [categoryOrders, setCategoryOrders] = useState<Record<string, string[]>>({})
  const [watchedVideoIds, setWatchedVideoIds] = useState<Set<string>>(new Set())

  const [showChallengeMode, setShowChallengeMode] = useState(false)

  // Function to switch to classic dashboard view
  const switchToClassicView = () => {
    // Dispatch a custom event to communicate with the parent dashboard component
    window.dispatchEvent(new CustomEvent('switchToClassicView'))
  }

  // Generate daily reminder based on user progress
  useEffect(() => {
    if (userProgress) {
      const suggestions: string[] = []
      // Don't set daily reminder if no suggestions available
      if (suggestions.length > 0) {
        setDailyReminder(suggestions[Math.floor(Math.random() * suggestions.length)])
      } else {
        setDailyReminder("")
      }
    }
  }, [userProgress])

  // Generate module suggestions
  useEffect(() => {
    if (userProgress) {
      const suggestions = [
        {
          name: "Sales",
          xpReward: 50,
          description: "Learn about sales operations",
          icon: "💰",
          isUnlocked: userProgress.unlockedModules.includes("Sales")
        },
        {
          name: "QA",
          xpReward: 75,
          description: "Master quality assurance",
          icon: "🔍",
          isUnlocked: userProgress.unlockedModules.includes("QA")
        },
        {
          name: "Processing",
          xpReward: 50,
          description: "Learn about processing operations",
          icon: "⚙️",
          isUnlocked: userProgress.unlockedModules.includes("Processing")
        },
        {
          name: "Inventory",
          xpReward: 75,
          description: "Master inventory management",
          icon: "📦",
          isUnlocked: userProgress.unlockedModules.includes("Inventory")
        },
        {
          name: "Finance",
          xpReward: 100,
          description: "Understand financial operations",
          icon: "💳",
          isUnlocked: userProgress.unlockedModules.includes("Finance and Accounting")
        }
      ]
      setModuleSuggestions(suggestions)
    }
  }, [userProgress])

  // Fetch top videos and their progress
  const fetchTopVideos = async () => {
    if (!auth.currentUser) return
    
    try {
      // Get all videos
      const videosQuery = query(collection(db, "videos"), orderBy("createdAt", "asc"))
      const videosSnapshot = await getDocs(videosQuery)
      const allVideos = videosSnapshot.docs.map(doc => {
        const data = doc.data() as any
        const thumbnailFromPublicId = data?.publicId
          ? getCloudinaryUrl(data.publicId, 'video')
          : undefined
        return {
          id: doc.id,
          ...data,
          // Normalize thumbnail field so the player poster always renders
          thumbnail: data?.thumbnailUrl || thumbnailFromPublicId,
        } as Video
      })

      // Get user's watch history
      const watchHistoryQuery = query(
        collection(db, "videoWatchEvents"),
        where("userId", "==", auth.currentUser.uid)
      )
      const watchHistorySnapshot = await getDocs(watchHistoryQuery)
      const watchHistory = watchHistorySnapshot.docs.map(doc => doc.data() as any)

      // Build a set of fully completed video IDs for consistent counting across UI
      const completedIds = new Set<string>(
        watchHistory
          .filter((e: any) => e?.completed === true && typeof e.videoId === 'string')
          .map((e: any) => e.videoId as string)
      )

      // Calculate progress for each video
      const progressData: {[key: string]: number} = {}
      allVideos.forEach(video => {
        const watchEvent = watchHistory.find(event => event.videoId === video.id)
        if (watchEvent) {
          // Calculate progress based on watch position vs duration
          const duration = parseInt(video.duration.match(/\d+/)?.[0] || "0")
          const position = watchEvent.lastPosition || 0
          progressData[video.id] = duration > 0 ? Math.min(100, (position / duration) * 100) : 0
        } else {
          progressData[video.id] = 0
        }
      })

      // Get top 3 videos by progress (most watched)
      const sortedVideos = allVideos
        .sort((a, b) => (progressData[b.id] || 0) - (progressData[a.id] || 0))
        .slice(0, 3)

      setTopVideos(sortedVideos)
      setVideoProgress(progressData)
      setAllVideos(allVideos) // Store all videos for module counting
      setWatchedVideoIds(completedIds)

      // Fetch saved per-module orders
      const orders = await getAllModuleVideoOrders()
      setCategoryOrders(orders)
    } catch (error) {
      console.error("Error fetching top videos:", error)
    }
  }

  // Fetch top videos when component mounts
  useEffect(() => {
    fetchTopVideos()
  }, [])

  const handleModuleClick = (module: any) => {
    if (module.isUnlocked) {
      router.push(`/dashboard?module=${module.name}`)
    } else {
      toast({
        title: "Module Locked",
        description: `Complete previous modules to unlock ${module.name}`,
        variant: "destructive"
      })
    }
  }

  // Open the module directly in the video player by creating a temporary playlist
  const startModuleFromCategory = (category: string) => {
    try {
      console.log(`🎯 Starting module from category: "${category}"`)
      
      // Get all videos for the selected category
      let moduleVideos = allVideos.filter((v) => v.category === category)
      const moduleOrder = categoryOrders[category]
      if (moduleOrder && moduleOrder.length > 0) {
        moduleVideos = [...moduleVideos].sort((a, b) => {
          const ia = moduleOrder.indexOf(a.id)
          const ib = moduleOrder.indexOf(b.id)
          const aPos = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
          const bPos = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
          return aPos - bPos
        })
      }
      console.log(`📹 Found ${moduleVideos.length} videos for category "${category}":`, moduleVideos.map(v => v.title))
      
      if (moduleVideos.length === 0) {
        console.log(`❌ No videos found for category "${category}"`)
        toast({
          title: "No Videos Found",
          description: `No videos found for the ${category} module. Please try another module.`,
          variant: "destructive"
        })
        return
      }

      // Get compulsory videos (Company Introduction, Additional Features, AI tools)
      let companyIntroVideos = allVideos.filter((v) => v.category === "Company Introduction")
      let additionalFeaturesVideos = allVideos.filter((v) => v.category === "Additional Features")
      let aiToolsVideos = allVideos.filter((v) => 
        v.category === "AI tools" || 
        v.category === "AI Tools" || 
        v.category === "ai tools" ||
        v.category === "Artificial Intelligence" ||
        v.category === "artificial intelligence"
      )

      // Apply saved order to compulsory categories as well
      const applyOrder = (list: Video[], key: string) => {
        const ord = categoryOrders[key]
        if (!ord || ord.length === 0) return list
        return [...list].sort((a, b) => {
          const ia = ord.indexOf(a.id)
          const ib = ord.indexOf(b.id)
          const aPos = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
          const bPos = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
          return aPos - bPos
        })
      }

      companyIntroVideos = applyOrder(companyIntroVideos, "Company Introduction")
      additionalFeaturesVideos = applyOrder(additionalFeaturesVideos, "Additional Features")
      aiToolsVideos = applyOrder(aiToolsVideos, "AI tools")

      console.log(`📹 Compulsory videos found:`)
      console.log(`   - Company Introduction: ${companyIntroVideos.length} videos`)
      console.log(`   - Additional Features: ${additionalFeaturesVideos.length} videos`)
      console.log(`   - AI tools: ${aiToolsVideos.length} videos`)

      // Combine all videos in the proper order: Company Intro + Selected Module + Additional Features + AI Tools
      const allPlaylistVideos = [
        ...companyIntroVideos,
        ...moduleVideos,
        ...additionalFeaturesVideos,
        ...aiToolsVideos,
      ].map(v => ({
        ...v,
        // Ensure thumbnail field is populated for the video player poster
        thumbnail: v.thumbnail || v.thumbnailUrl || (v.publicId ? getCloudinaryUrl((v as any).publicId, 'video') : undefined),
      }))

      console.log(`📋 Total playlist videos: ${allPlaylistVideos.length}`)
      console.log(`📋 Playlist structure:`, allPlaylistVideos.map(v => `${v.category}: ${v.title}`))

      // Find the first video of the selected module to start with
      const firstModuleVideo = moduleVideos[0]
      if (!firstModuleVideo) {
        console.log(`❌ No first video found for module "${category}"`)
        return
      }

      console.log(`🎬 Starting with video: "${firstModuleVideo.title}" (ID: ${firstModuleVideo.id})`)

      // Create the playlist with all videos
      const updatedPlaylist = {
        id: "custom-playlist",
        videos: allPlaylistVideos,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
      }
      localStorage.setItem("currentPlaylist", JSON.stringify(updatedPlaylist))

      // Store the user's selection to show only the selected module + compulsory modules
      const selectedVideoIds = moduleVideos.map(v => v.id)
      localStorage.setItem("selectedVideos", JSON.stringify(selectedVideoIds))

      console.log(`💾 Stored selected video IDs:`, selectedVideoIds)
      console.log(`💾 Selected videos details:`, moduleVideos.map(v => ({ id: v.id, title: v.title, category: v.category })))
      console.log(`💾 Category being stored: "${category}"`)

      const activePlaylist = {
        id: "custom-playlist",
        title: `${category} Module`,
        lastAccessed: new Date().toISOString(),
        completionPercentage: 0,
      }
      localStorage.setItem("activePlaylist", JSON.stringify(activePlaylist))

      // Navigate to video player starting with the first video of the selected module
      const videoPlayerUrl = `/video-player?videoId=${firstModuleVideo.id}&playlistId=custom-playlist`
      console.log(`🚀 Navigating to: ${videoPlayerUrl}`)
      router.push(videoPlayerUrl)
    } catch (error) {
      console.error("Error starting module from category:", error)
      toast({
        title: "Error",
        description: "Failed to start the module. Please try again.",
        variant: "destructive"
      })
    }
  }

  

  const getLevelTitle = (level: number) => {
    const titles = [
      "Beginner",
      "Apprentice",
      "Learner",
      "Student",
      "Practitioner",
      "Specialist",
      "Expert",
      "Master",
      "Grandmaster",
      "Legend"
    ]
    return titles[Math.min(level - 1, titles.length - 1)]
  }

  const getLevelColor = (level: number) => {
    if (level <= 3) return "text-blue-600"
    if (level <= 6) return "text-green-600"
    if (level <= 9) return "text-purple-600"
    return "text-orange-600"
  }

  const getLevelIcon = (level: number) => {
    if (level <= 3) return <BookOpen className="h-6 w-6" />
    if (level <= 6) return <Target className="h-6 w-6" />
    if (level <= 9) return <Trophy className="h-6 w-6" />
    return <Crown className="h-6 w-6" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userProgress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Progress...</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Daily Reminder Banner */}
        <AnimatePresence>
          {dailyReminder && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-white">{dailyReminder}</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={switchToClassicView}
                    >
                      <span className="hidden sm:inline">Start Learning</span>
                      <ArrowRight className="h-4 w-4 sm:ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prominent Start Learning Button */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white mb-2">🚀 Ready to Start Learning?</h2>
                  <p className="text-white/90">Begin your educational journey with EOXS modules and earn XP as you progress!</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={switchToClassicView}
                    variant="outline"
                    className="border-white text-white bg-white/20 hover:bg-white hover:text-green-600 font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <BookOpen className="mr-2 h-5 w-5" />
                    Browse Modules
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Progress & Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Level Progress Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/20 p-3 rounded-full">
                    {getLevelIcon(userProgress.currentLevel)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{getLevelTitle(userProgress.currentLevel)}</h2>
                    <p className="text-white">Level {userProgress.currentLevel}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Progress to Level {userProgress.currentLevel + 1}</span>
                    <span className="text-white">{Math.round(getLevelProgress())}%</span>
                  </div>
                  <Progress 
                    value={getLevelProgress()} 
                    className="h-2 bg-white/20 [&>div]:bg-white"
                  />
                  <p className="text-sm text-white">
                    {getXPToNextLevel()} XP needed for next level
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 p-2 rounded-full w-fit mx-auto mb-2">
                    <Play className="h-4 w-4" />
                  </div>
                  <p className="text-3xl font-normal text-white">{userProgress.totalVideosWatched}</p>
                  <p className="text-sm text-white">Videos Watched</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2">
                    <span className="text-[10px] font-bold text-white">XP</span>
                  </div>
                  <p className="text-3xl font-normal text-white">{userProgress.totalXP}</p>
                  <p className="text-sm text-white">Total XP</p>
                </CardContent>
              </Card>
            </div>

            {/* Streak Motivation moved under stats */}
            {userProgress.currentStreak > 0 && (
              <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Flame className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">Amazing Streak!</h3>
                      <p className="text-white">
                        You've been learning for {userProgress.currentStreak} day{userProgress.currentStreak !== 1 ? 's' : ''} in a row!
                      </p>
                      {userProgress.currentStreak >= 7 && (
                        <p className="text-sm text-white mt-1">
                          🎉 You've earned the "Week Warrior" badge!
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{userProgress.currentStreak}</p>
                      <p className="text-sm text-white">days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Learning Path & Suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Path */}
            <Card className="min-h-[440px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-12 w-7" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                      {(() => {
                  const totalVideos = allVideos.length
                  // Use strictly completed videos for watched count to match sidebar and classic dashboard
                  const watchedCount = allVideos.reduce((acc, v) => acc + (watchedVideoIds.has(v.id) ? 1 : 0), 0)
                  const unwatchedCount = Math.max(0, totalVideos - watchedCount)
                  const watchedPercent = totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0

                  const data = [
                    { name: "Watched", value: watchedCount, fill: "url(#watchedGradient)" },
                    { name: "Unwatched", value: unwatchedCount, fill: "#e5e7eb" },
                  ]

                  if (totalVideos === 0) {
                    return (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-4xl mb-2">📹</div>
                        <p className="text-sm">No videos available</p>
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-6">
                      <div className="h-64 w-full flex items-center justify-center">
                        <div className="w-full h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <defs>
                                <linearGradient id="watchedGradient" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#22c55e" />
                                  <stop offset="100%" stopColor="#16a34a" />
                                </linearGradient>
                              </defs>
                              {/* Background track */}
                              <Pie
                                data={[{ name: "Track", value: 100 }]}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                outerRadius={96}
                                innerRadius={62}
                                stroke="none"
                                isAnimationActive={false}
                                fill="#eef2f7"
                              />
                              {/* Foreground progress */}
                              <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={96}
                                innerRadius={62}
                                isAnimationActive
                                labelLine={false}
                              >
                                {data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill as string} />
                                ))}
                                <Label
                                  position="center"
                                  content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                      const cx = (viewBox as any).cx
                                      const cy = (viewBox as any).cy
                                      return (
                                        <g>
                                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" alignmentBaseline="middle" dy="0.35em" className="fill-gray-900" fontSize={22} fontWeight={700}>
                                            {watchedPercent}%
                                          </text>
                                        </g>
                                      )
                                    }
                                    return null
                                  }}
                                />
                              </Pie>
                              <Tooltip formatter={(value: any) => {
                                const val = Number(value as number)
                                const pct = totalVideos > 0 ? Math.round((val / totalVideos) * 100) : 0
                                return [`${pct}%`, ""]
                              }} />
                            </PieChart>
                          </ResponsiveContainer>
                                  </div>
                                </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg border p-4 text-center">
                          <div className="text-sm text-gray-500">Total Videos</div>
                          <div className="text-2xl font-semibold">{totalVideos}</div>
                                  </div>
                        <div className="rounded-lg border p-4 text-center">
                          <div className="text-sm text-gray-500">Watched</div>
                          <div className="text-2xl font-semibold text-green-600">{watchedCount}</div>
                                </div>
                        <div className="rounded-lg border p-4 text-center">
                          <div className="text-sm text-gray-500">Remaining</div>
                          <div className="text-2xl font-semibold text-gray-700">{unwatchedCount}</div>
                        </div>
                      </div>
                </div>
                  )
                })()}
              </CardContent>
            </Card>

            

            {/* Streak Motivation moved to left column */}
          </div>
        </div>
      </main>

      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0
                }}
                animate={{
                  y: window.innerHeight + 10,
                  rotate: 360,
                  x: Math.random() * window.innerWidth
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  ease: "easeOut"
                }}
                onAnimationComplete={() => {
                  if (i === 49) {
                    setTimeout(() => setShowConfetti(false), 1000)
                  }
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>



      {/* Challenge Mode */}
      <ChallengeMode 
        isVisible={showChallengeMode} 
        onClose={() => setShowChallengeMode(false)}
      />
    </div>
  )
} 