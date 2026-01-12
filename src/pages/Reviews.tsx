import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Star, 
  Send, 
  User, 
  Quote, 
  Sparkles,
  ThumbsUp,
  Calendar,
  MessageSquare,
  Award,
  TrendingUp
} from "lucide-react";

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  likes: number;
  avatar?: string;
}

const initialReviews: Review[] = [
  {
    id: "1",
    userName: "Rahul Sharma",
    rating: 5,
    comment: "RideWise is amazing! The predictions are incredibly accurate. I've been using it for planning my daily commute and it's saved me so much time. The AI chatbot is super helpful too!",
    date: "2025-01-10",
    likes: 24
  },
  {
    id: "2",
    userName: "Priya Patel",
    rating: 4,
    comment: "Great platform for bike rental predictions. The hourly prediction feature is particularly useful for planning weekend rides. Would love to see more weather integrations!",
    date: "2025-01-09",
    likes: 18
  },
  {
    id: "3",
    userName: "Amit Kumar",
    rating: 5,
    comment: "The comfort index calculation is brilliant! It really helps me decide when to rent a bike. The dark mode looks stunning. Best prediction app I've used!",
    date: "2025-01-08",
    likes: 32
  },
  {
    id: "4",
    userName: "Sneha Reddy",
    rating: 4,
    comment: "Love the reservation feature! Being able to book bikes in advance based on predictions is game-changing. The UI is very intuitive and modern.",
    date: "2025-01-07",
    likes: 15
  }
];

const StarRating = ({ 
  rating, 
  onRatingChange, 
  interactive = false,
  size = "default"
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "default" | "large";
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const starSize = size === "large" ? "h-8 w-8" : "h-5 w-5";
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`transition-all duration-200 ${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"}`}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= (hoverRating || rating)
                ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes);

  const handleLike = () => {
    if (!liked) {
      setLikeCount(prev => prev + 1);
    } else {
      setLikeCount(prev => prev - 1);
    }
    setLiked(!liked);
  };

  return (
    <Card className="group hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 border-border/50 hover:border-primary/30 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="p-6 relative">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            {review.rating === 5 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                <Award className="h-3 w-3 text-yellow-900" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-foreground">{review.userName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-muted-foreground">
                    ({review.rating}/5)
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {new Date(review.date).toLocaleDateString('en-IN', { 
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="mt-4 relative">
              <Quote className="absolute -left-2 -top-2 h-6 w-6 text-primary/20" />
              <p className="text-muted-foreground leading-relaxed pl-4">
                {review.comment}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`gap-2 transition-all ${
                  liked 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                <span>{likeCount}</span>
              </Button>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                Helpful review
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newReview, setNewReview] = useState({
    userName: "",
    rating: 0,
    comment: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.rating || !newReview.comment) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const review: Review = {
      id: Date.now().toString(),
      userName: newReview.userName,
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    setReviews([review, ...reviews]);
    setNewReview({ userName: "", rating: 0, comment: "" });
    setIsSubmitting(false);
    setSubmitted(true);
    
    setTimeout(() => setSubmitted(false), 3000);
  };

  const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 rounded-3xl blur-3xl" />
          <div className="relative bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl gradient-primary shadow-lg shadow-primary/30">
                <MessageSquare className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold gradient-text">User Reviews</h1>
                <p className="text-muted-foreground">See what our users are saying about RideWise</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl px-5 py-3">
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold">{averageRating}</p>
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl px-5 py-3">
                <TrendingUp className="h-6 w-6 text-success" />
                <div>
                  <p className="text-2xl font-bold">{reviews.length}</p>
                  <p className="text-xs text-muted-foreground">Total Reviews</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl px-5 py-3">
                <ThumbsUp className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{reviews.reduce((acc, r) => acc + r.likes, 0)}</p>
                  <p className="text-xs text-muted-foreground">Total Likes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Review Form */}
        <Card className="border-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              Share Your Experience
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-success animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold text-success">Thank you for your review!</h3>
                <p className="text-muted-foreground mt-2">Your feedback helps us improve RideWise</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Your Name
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={newReview.userName}
                      onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      Your Rating
                    </label>
                    <div className="flex items-center gap-3 h-12">
                      <StarRating 
                        rating={newReview.rating} 
                        onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
                        interactive
                        size="large"
                      />
                      {newReview.rating > 0 && (
                        <span className="text-sm text-muted-foreground animate-in fade-in">
                          {newReview.rating === 5 ? "Excellent!" : 
                           newReview.rating === 4 ? "Great!" :
                           newReview.rating === 3 ? "Good" :
                           newReview.rating === 2 ? "Fair" : "Poor"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    Your Review
                  </label>
                  <Textarea
                    placeholder="Share your experience with RideWise... What features do you love? How has it helped you?"
                    rows={4}
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="resize-none"
                    required
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full md:w-auto"
                  disabled={isSubmitting || !newReview.userName || !newReview.rating || !newReview.comment}
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Quote className="h-5 w-5 text-primary" />
            Recent Reviews
          </h2>
          <div className="grid gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reviews;
