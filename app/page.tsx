import * as React from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Brain, Shield, CircleDot, Heart, Sparkles, Workflow, Network, MessageSquare, Check, ChevronDown, ArrowRight, Book, Lightbulb, Target, Play } from 'lucide-react'
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs'

export default function EnhancedLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-white to-gray-100 text-gray-900">
      <header className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">MindPattern</div>
        <div className="flex items-center gap-2">
          <SignedIn>
            <Button asChild variant="outline" className="hidden sm:inline-flex mr-2">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Button asChild variant="outline">
              <SignInButton mode="modal">Sign In</SignInButton>
            </Button>
          </SignedOut>
        </div>
      </header>

        <div className="container mx-auto px-4 py-6 sm:py-12">
          {/* Hero Section - Hitting Pain Points Harder */}
          <section className="text-center mb-12 sm:mb-20">
            <div className="inline-block mb-4 sm:mb-6">
              <span className="bg-blue-500/20 text-blue-600 text-sm font-medium px-4 py-2 rounded-full">
                Your 24/7 Emotional Support Companion
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text leading-tight">
              AI Recognizes Your <br className="hidden sm:block" />Patterns & Makes You a Plan
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Talk naturally about your life. Todd will identify behavior patterns, spots what's holding you back, and helps you take meaningful steps forward.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <SignedIn>
                <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </SignedIn>
              <SignedOut>
                <Button asChild size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                  <SignInButton mode="modal">Start Talking Now - It's Free</SignInButton>
                </Button>
              </SignedOut>
            </div>
            <p className="mt-4 text-gray-500 text-sm">No credit card required. Start instantly.</p>
          </section>

          <section className="mb-12 sm:mb-20">
            <div className="max-w-4xl mx-auto rounded-2xl p-6 sm:p-12">
              <div className="space-y-8 sm:space-y-12">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto sm:mx-0">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Here When Others Aren't</h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      Spiraling at 3 AM? Having a crisis on Sunday? Need to vent during lunch? 
                      We're here 24/7 - no appointments, no waitlists, no "that sucks" responses. 
                      Just real support when you actually need it.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto sm:mx-0">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Actually Remembers Your Story</h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      Tired of repeating yourself? Our AI remembers everything - your past conversations, 
                      patterns, and progress. We connect the dots to help you understand yourself better 
                      and make real progress.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto sm:mx-0">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">Beyond Just Talk</h3>
                    <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                      Not just another chat app. We use advanced AI to identify patterns, 
                      provide actionable insights, and help you create practical steps forward. 
                      Small changes, real progress, no BS.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Your Personalized Path Section */}
          <section className="mb-20 bg-blue-50 py-16 px-4 rounded-2xl">
            <h2 className="text-3xl font-bold text-center mb-12">Your Personalized Path to Emotional Wellness</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Book className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Comprehensive Assessment</h3>
                <p className="text-gray-600 mb-2">Gain deep insights into your emotional landscape through:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Personality trait analysis</li>
                  <li>Emotional intelligence evaluation</li>
                  <li>Stress response patterns</li>
                  <li>Personal growth goals identification</li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. AI-Powered Therapy Sessions</h3>
                <p className="text-gray-600 mb-2">Experience transformative conversations that:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Adapt to your unique communication style</li>
                  <li>Provide real-time emotional support</li>
                  <li>Offer personalized coping strategies</li>
                  <li>Challenge limiting beliefs constructively</li>
                </ul>
              </div>
          

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Continuous Growth & Insights</h3>
                <p className="text-gray-600 mb-2">Track your progress and evolve with:</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Personalized growth analytics</li>
                  <li>Emotional resilience development</li>
                  <li>Habit formation tracking</li>
                  <li>Milestone celebrations and rewards</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Testimonial Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
              <blockquote className="text-center">
                <p className="text-xl italic mb-4">"MindPattern has been a game-changer for my mental health journey. The personalized insights and always-available support have made a significant difference in my daily life."</p>
                <footer className="text-gray-600">
                  <strong>Sarah K.</strong> - MindPattern user for 6 months
                </footer>
              </blockquote>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Invest in Your Emotional Well-being</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl mb-2">Starter</CardTitle>
                  <div className="text-4xl font-bold mb-2">Free</div>
                  <p className="text-gray-600 text-sm">Begin your journey to self-discovery</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">5 AI therapy sessions/month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Basic emotional assessment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Text-based chat support</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">Start Your Journey</Button>
                </CardContent>
              </Card>

              <Card className="border-blue-500">
                <CardHeader>
                  <CardTitle className="text-xl mb-2">Growth</CardTitle>
                  <div className="text-4xl font-bold mb-2">$19<span className="text-lg text-gray-600">/month</span></div>
                  <p className="text-gray-600 text-sm">Accelerate your emotional growth</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Unlimited AI therapy sessions</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Advanced emotional assessments</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Voice & text chat support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Personalized growth insights</span>
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Start 7-Day Free Trial</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl mb-2">Transformation</CardTitle>
                  <div className="text-4xl font-bold mb-2">$49<span className="text-lg text-gray-600">/month</span></div>
                  <p className="text-gray-600 text-sm">Unlock your full potential</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">All Growth plan features</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Priority 24/7 support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Advanced pattern analysis</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Personalized action plans</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-600 mt-1" />
                      <span className="text-gray-700">Monthly progress reviews</span>
                    </li>
                  </ul>
                  <Button className="w-full" variant="outline">Start 7-Day Free Trial</Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="bg-white rounded-xl border border-gray-200">
                  <AccordionTrigger className="px-6 text-left">
                    How is MindPattern different from other AI therapy apps?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Unlike basic chatbots, MindPattern uses advanced technologies like Hume AI for emotion detection and RAG-based pattern recognition to truly understand your unique situation. We combine voice analysis, personality assessment, and adaptive learning to provide personalized support that evolves with you over time.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-white rounded-xl border border-gray-200">
                  <AccordionTrigger className="px-6 text-left">
                    Is MindPattern a replacement for traditional therapy?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    No, MindPattern is not a replacement for professional mental health care. While we provide valuable support and insights, we recommend using our platform as a complement to traditional therapy. If you're experiencing severe mental health issues, please consult with a licensed mental health professional.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-white rounded-xl border border-gray-200">
                  <AccordionTrigger className="px-6 text-left">
                    How do you protect my privacy and data?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    We take your privacy seriously. All conversations are end-to-end encrypted, and your data is stored securely using industry-standard encryption. We never share your personal information with third parties, and you can request data deletion at any time. Our AI analysis happens in real-time and is focused on helping you, not collecting data.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-white rounded-xl border border-gray-200">
                  <AccordionTrigger className="px-6 text-left">
                    What kind of results can I expect?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    Users typically report increased self-awareness and better emotional regulation within the first month. Our pattern recognition helps identify triggers and behavioral patterns, leading to more effective coping strategies. However, progress varies by individual and depends on engagement level and personal goals.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-white rounded-xl border border-gray-200">
                  <AccordionTrigger className="px-6 text-left">
                    How often should I use MindPattern?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    For optimal results, we recommend using MindPattern daily. Even a few minutes each day can help build emotional awareness and resilience. However, the frequency may vary based on your personal needs and goals. Our AI adapts to your usage patterns to provide the most effective support.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="bg-white rounded-xl border border-gray-200">
                  <AccordionTrigger className="px-6 text-left">
                    Can I use MindPattern alongside traditional therapy?
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600">
                    MindPattern is designed to complement traditional therapy. Many users find that combining MindPattern with in-person therapy sessions enhances their overall mental health journey. We recommend discussing the use of digital mental health tools with your therapist to ensure it aligns with your treatment plan.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>

          {/* Enhanced CTA Section */}
          <section className="text-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-12 mb-20">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Transform Your Mental Health Journey Today
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands who've discovered newfound emotional balance and personal growth with MindPattern's AI-powered support.
            </p>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              <SignInButton mode="modal">Start Talking Now - It's Free</SignInButton>
            </Button>
          </section>

          {/* Footer */}
          <footer className="border-t border-gray-200 pt-12 pb-8">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold mb-4">MindPattern</h3>
                  <p className="text-sm text-gray-600">
                    AI-powered mental health support that grows with you.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Resources</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="/blog">Blog</Link></li>
                    <li><Link href="/research">Research</Link></li>
                    <li><Link href="/case-studies">Case Studies</Link></li>
                    <li><Link href="/documentation">Documentation</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="/about">About Us</Link></li>
                    <li><Link href="/careers">Careers</Link></li>
                    <li><Link href="/press">Press</Link></li>
                    <li><Link href="/contact">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Legal</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li><Link href="/privacy">Privacy Policy</Link></li>
                    <li><Link href="/terms">Terms of Service</Link></li>
                    <li><Link href="/security">Security</Link></li>
                    <li><Link href="/gdpr">GDPR</Link></li>
                  </ul>
                </div>
              </div>
              <div className="text-center text-gray-600 text-sm">
                <p> 2024 MindPattern. All rights reserved.</p>
                <p className="mt-2">
                  MindPattern is not a replacement for professional medical advice. Always consult qualified healthcare providers for medical decisions.
                </p>
                <p className="mt-2">
                  If you're experiencing a mental health emergency, please contact emergency services or your local crisis hotline immediately.
                </p>
              </div>
            </div>
          </footer>
        </div>
    </div>
  )
}
