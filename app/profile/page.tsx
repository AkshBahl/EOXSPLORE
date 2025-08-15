"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  BookOpen, 
  Flame,
  Award,
  Crown,
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  ArrowLeft,
  Sparkles,
  CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGamification } from "../context/GamificationContext"
import { useAuth } from "../context/AuthContext"
import UserQuizStats from "../components/UserQuizStats"

export default function ProfilePage() {
  const router = useRouter()
  const { userProgress, loading } = useGamification()
  const { userData } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

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
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">Unable to load your profile data.</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
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

  const getLevelIcon = (level: number) => {
    if (level <= 3) return <BookOpen className="h-6 w-6" />
    if (level <= 6) return <Target className="h-6 w-6" />
    if (level <= 9) return <Trophy className="h-6 w-6" />
    return <Crown className="h-6 w-6" />
  }

  const getLevelColor = (level: number) => {
    if (level <= 3) return "text-blue-600"
    if (level <= 6) return "text-green-600"
    if (level <= 9) return "text-purple-600"
    return "text-orange-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold">Profile</h1>
                <p className="text-sm text-muted-foreground">Your learning journey</p>
              </div>
            </div>
          <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50">
                <Sparkles className="h-3 w-3 mr-1" />
                Level {userProgress.currentLevel}
              </Badge>
              <Badge variant="outline" className="bg-orange-50">
                <Flame className="h-3 w-3 mr-1" />
                {userProgress.currentStreak} day streak
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Level Progress Card */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/20 p-4 rounded-full">
                    {getLevelIcon(userProgress.currentLevel)}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{getLevelTitle(userProgress.currentLevel)}</h2>
                    <p className="text-white">Level {userProgress.currentLevel}</p>
                  </div>
            </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">Progress to Level {userProgress.currentLevel + 1}</span>
                    <span className="text-white">{Math.round((userProgress.totalXP % 100) / 100 * 100)}%</span>
                  </div>
                  <Progress 
                    value={(userProgress.totalXP % 100) / 100 * 100} 
                    className="h-3 bg-white/20"
                  />
                  <p className="text-xs text-white">
                    {100 - (userProgress.totalXP % 100)} XP needed for next level
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 p-2 rounded-full w-fit mx-auto mb-2">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userProgress.totalVideosWatched}</p>
                  <p className="text-xs text-white">Videos Watched</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 p-2 rounded-full w-fit mx-auto mb-2">
                    <Flame className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userProgress.currentStreak}</p>
                  <p className="text-xs text-white">Day Streak</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 p-2 rounded-full w-fit mx-auto mb-2">
                    <Award className="h-4 w-4" />
                    </div>
                  <p className="text-2xl font-bold text-white">{userProgress.badges.length}</p>
                  <p className="text-xs text-white">Badges Earned</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
                <CardContent className="p-4 text-center">
                  <div className="bg-white/20 p-2 rounded-full w-fit mx-auto mb-2">
                    <Star className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-white">{userProgress.achievements.length}</p>
                  <p className="text-xs text-white">Achievements</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Watched {userProgress.totalVideosWatched} videos</p>
                      <p className="text-sm text-muted-foreground">Total learning time: {userProgress.totalWatchTime} minutes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <Flame className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{userProgress.currentStreak} day learning streak</p>
                      <p className="text-sm text-muted-foreground">Longest streak: {userProgress.longestStreak} days</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{userProgress.totalXP} XP earned</p>
                      <p className="text-sm text-muted-foreground">Level {userProgress.currentLevel} reached</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Achievements ({userProgress.achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProgress.achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                    <p className="text-muted-foreground">Keep learning to unlock achievements!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProgress.achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{achievement.name}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="bg-green-100 text-green-700">
                                <Zap className="h-3 w-3 mr-1" />
                                +{achievement.xpReward} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Badges ({userProgress.badges.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userProgress.badges.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Badges Yet</h3>
                    <p className="text-muted-foreground">Complete activities to earn badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userProgress.badges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 text-center"
                      >
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <h3 className="font-semibold mb-1">{badge.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                        <Badge variant="outline" className="bg-blue-100 text-blue-700">
                          {badge.category}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Learning Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Learning Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Videos Watched</span>
                    <span className="font-bold">{userProgress.totalVideosWatched}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Watch Time</span>
                    <span className="font-bold">{userProgress.totalWatchTime} minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current Streak</span>
                    <span className="font-bold">{userProgress.currentStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Longest Streak</span>
                    <span className="font-bold">{userProgress.longestStreak} days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total XP Earned</span>
                    <span className="font-bold">{userProgress.totalXP}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current Level</span>
                    <span className="font-bold">{userProgress.currentLevel}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quiz Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(userProgress.quizScores).length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No quizzes completed yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(userProgress.quizScores).map(([quizId, score]) => (
                        <div key={quizId} className="flex justify-between items-center">
                          <span className="text-sm">Quiz {quizId}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{score}%</span>
                            {score === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Progress Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Learning Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Started Learning Journey</p>
                      <p className="text-sm text-muted-foreground">Level 1 - Beginner</p>
                    </div>
                  </div>
                  
                  {userProgress.totalVideosWatched > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">First Video Completed</p>
                        <p className="text-sm text-muted-foreground">Earned First Steps badge</p>
                      </div>
                    </div>
                  )}
                  
                  {userProgress.currentStreak >= 3 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">3-Day Streak Achieved</p>
                        <p className="text-sm text-muted-foreground">Earned Getting Started badge</p>
                      </div>
                    </div>
                  )}
                  
                  {userProgress.currentLevel > 1 && (
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Level Up!</p>
                        <p className="text-sm text-muted-foreground">Reached Level {userProgress.currentLevel}</p>
          </div>
        </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            <UserQuizStats />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
} 