import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/layout/Navigation";
import { BackButton } from "@/components/layout/BackButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Linkedin,
  Sparkles,
  Upload,
  X,
  Edit2,
  Loader2,
  Download,
  Image as ImageIcon,
  Copy,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { createLinkedinPost} from "@/services/linkedinService";

const imageStyleOptions = [
  { label: "Realistic", value: "realistic" },
  { label: "Illustration", value: "illustration" },
  { label: "3D", value: "three_d" },
  { label: "Minimal", value: "minimal" },
  { label: "Comic", value: "comic" },
  { label: "Professional poster", value: "professional_poster" },
];

const imageMoodOptions = [
  { label: "Professional", value: "professional" },
  { label: "Friendly", value: "friendly" },
  { label: "Inspirational", value: "inspirational" },
  { label: "Modern", value: "modern" },
  { label: "Confident", value: "confident" },
];

const imageColorOptions = [
  { label: "Blue and purple", value: "blue_purple" },
  { label: "Black and white", value: "black_white" },
  { label: "Warm colors", value: "warm" },
  { label: "Pastel", value: "pastel" },
  { label: "Custom", value: "custom" },
];

const imagePeopleOptions = [
  { label: "No people", value: "no_people" },
  { label: "Female", value: "female" },
  { label: "Male", value: "male" },
  { label: "Group of people", value: "group_of_people" },
];

const imageTextOptions = [
  { label: "No text", value: "no_text" },
  { label: "Use post title", value: "short_title" },
  { label: "Custom text", value: "custom_text" },
];

export default function LinkedInManager() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");

  const [imageDescription, setImageDescription] = useState("");
  const [imageStyle, setImageStyle] = useState("illustration");
  const [imageMood, setImageMood] = useState("professional");
  const [imageColors, setImageColors] = useState("blue_purple");
  const [customImageColors, setCustomImageColors] = useState("");
  const [imagePeople, setImagePeople] = useState("no_people");
  const [imageTextOption, setImageTextOption] = useState("no_text");
  const [imageText, setImageText] = useState("");

  const [generatedPost, setGeneratedPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);

  const resetForm = () => {
    setGeneratedPost("");
    setTopic("");
    setDescription("");
    setUploadedImage(null);
    setIsEditing(false);
    setImageDescription("");
    setImageStyle("illustration");
    setImageMood("professional");
    setImageColors("blue_purple");
    setCustomImageColors("");
    setImagePeople("no_people");
    setImageTextOption("no_text");
    setImageText("");
  };

  const normalizeImage = (image?: string) => {
    if (!image) return null;
    if (image.startsWith("data:image")) return image;
    return `data:image/png;base64,${image}`;
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Missing topic",
        description: "Please provide a topic for your LinkedIn post.",
        variant: "destructive",
      });
      return;
    }

    if (imageColors === "custom" && !customImageColors.trim()) {
      toast({
        title: "Missing custom colors",
        description: "Please describe the custom color theme you want.",
        variant: "destructive",
      });
      return;
    }

    if (imageTextOption === "custom_text" && !imageText.trim()) {
      toast({
        title: "Missing image text",
        description: "Please enter the custom text you want on the image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setUploadedImage(null);

    try {
      const result = await createLinkedinPost({
        title: topic.trim(),
        description: description.trim() || topic.trim(),
        image_description: imageDescription.trim(),
        image_style: imageStyle,
        image_mood: imageMood,
        image_colors: imageColors,
        custom_image_colors: customImageColors.trim(),
        image_people: imagePeople,
        image_text_option: imageTextOption,
        image_text: imageText.trim(),
      });

      setGeneratedPost(result.content || "");

      const finalImage = normalizeImage(result.image);
      if (finalImage) {
        setUploadedImage(finalImage);
      }

      setIsEditing(false);

      toast({
        title: "Post Generated!",
        description: "Review your AI-generated LinkedIn post and image below.",
      });
    } catch (err: any) {
      toast({
        title: "Generation Failed",
        description: err?.response?.data?.message || "Failed to generate post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!uploadedImage) return;
    const link = document.createElement("a");
    link.href = uploadedImage;
    link.download = `linkedin-post-image-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="max-w-3xl mx-auto">
          <BackButton className="mb-6" />

          <div className="mb-12 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-card/50 backdrop-blur-sm">
                <Linkedin className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">
                  LinkedIn Content Manager
                </span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              LinkedIn Post Generator
            </h1>

            <p className="text-xl text-muted-foreground">
              Create professional LinkedIn posts with clear content and
              personalized image details.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <Card className="gradient-card border-border shadow-card p-6 w-full">
              <h3 className="font-semibold mb-4">Posting Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>Use a clear topic so the post stays focused.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>Add image details to avoid random visuals.</span>
                  </li>
                </ul>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-accent">•</span>
                    <span>After generation, download the image and copy the post text to publish manually on LinkedIn.</span>
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="gradient-card border-border shadow-card p-6 w-full">
              <h3 className="font-semibold mb-2">Create New Post</h3>

              <p className="text-sm text-muted-foreground mb-6">
                Add your post idea first, then optionally customize the image
                that will be generated with it.
              </p>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Post Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Tell us what the LinkedIn post should be about.
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Post Topic
                    </label>
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Example: AI-powered interview preparation"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Additional Post Details
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Example: Write about how AI helps students practice interview questions and build confidence."
                      className="min-h-[110px]"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <ImageIcon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Image Details</h4>
                      <p className="text-sm text-muted-foreground">
                        Optional: guide the AI image so it looks more relevant
                        and less random.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Image Description
                    </label>
                    <Textarea
                      value={imageDescription}
                      onChange={(e) => setImageDescription(e.target.value)}
                      placeholder="Example: A young professional practicing an online interview with an AI assistant on a laptop."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Image Style
                      </label>
                      <select
                        value={imageStyle}
                        onChange={(e) => setImageStyle(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm text-left"
                      >
                        {imageStyleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Mood
                      </label>
                      <select
                        value={imageMood}
                        onChange={(e) => setImageMood(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm text-left"
                      >
                        {imageMoodOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Color Theme
                      </label>
                      <select
                        value={imageColors}
                        onChange={(e) => setImageColors(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm text-left"
                      >
                        {imageColorOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        People in Image
                      </label>
                      <select
                        value={imagePeople}
                        onChange={(e) => setImagePeople(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm text-left"
                      >
                        {imagePeopleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Text in Image
                      </label>
                      <select
                        value={imageTextOption}
                        onChange={(e) => setImageTextOption(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background pl-3 pr-10 py-2 text-sm text-left"
                      >
                        {imageTextOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {imageColors === "custom" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Custom Color Theme
                      </label>
                      <Input
                        value={customImageColors}
                        onChange={(e) => setCustomImageColors(e.target.value)}
                        placeholder="Example: dark green and gold"
                      />
                    </div>
                  )}

                  {imageTextOption === "custom_text" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Custom Image Text
                      </label>
                      <Input
                        value={imageText}
                        onChange={(e) => setImageText(e.target.value)}
                        placeholder="Example: Prepare smarter with AI"
                      />
                    </div>
                  )}
                </div>

                <Button
                  variant="hero"
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Post...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Post
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {generatedPost && (
              <Card className="gradient-card border-border shadow-card p-6 animate-slide-up w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Generated Post</h3>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(!isEditing)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {isEditing ? "Preview" : "Edit"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPost);
                        toast({
                          title: "Copied!",
                          description: "Post text copied to clipboard",
                        });
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Post
                    </Button>

                    {uploadedImage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadImage}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Image
                      </Button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Download the generated image and copy the post text, then publish manually on LinkedIn.
                </p>

                {uploadedImage && (
                  <div className="relative mb-4">
                    <img
                      src={uploadedImage}
                      alt="Generated post visual"
                      className="w-full h-auto object-contain rounded-lg border border-border"
                    />
                  </div>
                )}

                {isEditing ? (
                  <Textarea
                    value={generatedPost}
                    onChange={(e) => setGeneratedPost(e.target.value)}
                    placeholder="Edit your LinkedIn post..."
                    className="min-h-[150px] mb-4"
                  />
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 mb-4 min-h-[150px]">
                    <p className="whitespace-pre-wrap">{generatedPost}</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}