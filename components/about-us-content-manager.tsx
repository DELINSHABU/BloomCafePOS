"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Save, 
  RefreshCw, 
  Eye, 
  Edit3, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Users,
  Coffee,
  Star,
  Heart,
  Award,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AboutUsContent {
  header: {
    logo: string;
    logoAlt: string;
    logoWidth: number;
    logoHeight: number;
    tagline: string;
    backgroundVideo: string;
  };
  sections: {
    ourStory: {
      title: string;
      icon: string;
      iconColor: string;
      content: string;
      glassEffect: any;
    };
    whatMakesUsSpecial: {
      title: string;
      icon: string;
      iconColor: string;
      features: Array<{
        icon: string;
        iconColor: string;
        title: string;
        description: string;
      }>;
      glassEffect: any;
    };
    visitUs: {
      title: string;
      icon: string;
      iconColor: string;
      location: {
        icon: string;
        title: string;
        address: string[];
      };
      contact: {
        phone: {
          icon: string;
          title: string;
          number: string;
        };
        email: {
          icon: string;
          title: string;
          address: string;
        };
      };
      hours: {
        icon: string;
        title: string;
        schedule: Array<{
          days: string;
          time: string;
        }>;
      };
      glassEffect: any;
    };
    ourMission: {
      title: string;
      content: string;
      textColor: string;
      contentColor: string;
      glassEffect: any;
    };
  };
  backToMenuButton: {
    text: string;
    className: string;
  };
  lastUpdated: string;
  updatedBy: string;
}

interface AboutUsContentManagerProps {
  currentUser?: { username: string; role: string; name: string };
}

export default function AboutUsContentManager({ currentUser }: AboutUsContentManagerProps) {
  const [content, setContent] = useState<AboutUsContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState("header");

  // Load content on mount
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/about-us-content');
      if (response.ok) {
        const data = await response.json();
        setContent(data);
        setMessage({ type: 'info', text: `Last updated: ${new Date(data.lastUpdated).toLocaleString()}` });
      } else {
        setMessage({ type: 'error', text: 'Failed to load About Us content' });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setMessage({ type: 'error', text: 'Error loading About Us content' });
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!content) return;

    try {
      setSaving(true);
      const updatedContent = {
        ...content,
        updatedBy: currentUser?.username || 'superadmin'
      };

      const response = await fetch('/api/about-us-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedContent),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: 'About Us content saved successfully!' });
        setContent(prev => prev ? { ...prev, lastUpdated: result.lastUpdated } : prev);
      } else {
        setMessage({ type: 'error', text: 'Failed to save About Us content' });
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setMessage({ type: 'error', text: 'Error saving About Us content' });
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (path: string, value: any) => {
    if (!content) return;
    
    const pathArray = path.split('.');
    const newContent = { ...content };
    let current: any = newContent;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    setContent(newContent);
  };

  const updateFeature = (index: number, field: string, value: string) => {
    if (!content) return;
    
    const newFeatures = [...content.sections.whatMakesUsSpecial.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    
    setContent({
      ...content,
      sections: {
        ...content.sections,
        whatMakesUsSpecial: {
          ...content.sections.whatMakesUsSpecial,
          features: newFeatures
        }
      }
    });
  };

  const updateSchedule = (index: number, field: 'days' | 'time', value: string) => {
    if (!content) return;
    
    const newSchedule = [...content.sections.visitUs.hours.schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    
    setContent({
      ...content,
      sections: {
        ...content.sections,
        visitUs: {
          ...content.sections.visitUs,
          hours: {
            ...content.sections.visitUs.hours,
            schedule: newSchedule
          }
        }
      }
    });
  };

  const iconOptions = [
    { value: 'Heart', label: 'Heart' },
    { value: 'Star', label: 'Star' },
    { value: 'MapPin', label: 'Map Pin' },
    { value: 'Coffee', label: 'Coffee' },
    { value: 'Users', label: 'Users' },
    { value: 'Award', label: 'Award' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Mail', label: 'Mail' },
    { value: 'Clock', label: 'Clock' },
  ];

  const colorOptions = [
    { value: 'text-red-400', label: 'Red' },
    { value: 'text-blue-400', label: 'Blue' },
    { value: 'text-yellow-400', label: 'Yellow' },
    { value: 'text-emerald-400', label: 'Emerald' },
    { value: 'text-purple-400', label: 'Purple' },
    { value: 'text-pink-400', label: 'Pink' },
    { value: 'text-orange-400', label: 'Orange' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading About Us content...</span>
      </div>
    );
  }

  if (!content) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load About Us content. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Edit3 className="w-6 h-6" />
              About Us Content Manager
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Edit all content for the About Us page
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={loadContent}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={saveContent}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {message && (
          <Alert className={message.type === 'error' ? 'border-red-500' : message.type === 'success' ? 'border-green-500' : 'border-blue-500'}>
            {message.type === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="story">Our Story</TabsTrigger>
          <TabsTrigger value="special">What Makes Us Special</TabsTrigger>
          <TabsTrigger value="visit">Visit Us</TabsTrigger>
          <TabsTrigger value="mission">Our Mission</TabsTrigger>
        </TabsList>

        {/* Header Tab */}
        <TabsContent value="header" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Header Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo">Logo Path</Label>
                  <Input
                    id="logo"
                    value={content.header.logo}
                    onChange={(e) => updateContent('header.logo', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="logoAlt">Logo Alt Text</Label>
                  <Input
                    id="logoAlt"
                    value={content.header.logoAlt}
                    onChange={(e) => updateContent('header.logoAlt', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="logoWidth">Logo Width</Label>
                  <Input
                    id="logoWidth"
                    type="number"
                    value={content.header.logoWidth}
                    onChange={(e) => updateContent('header.logoWidth', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="logoHeight">Logo Height</Label>
                  <Input
                    id="logoHeight"
                    type="number"
                    value={content.header.logoHeight}
                    onChange={(e) => updateContent('header.logoHeight', parseInt(e.target.value))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={content.header.tagline}
                    onChange={(e) => updateContent('header.tagline', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="backgroundVideo">Background Video Path</Label>
                  <Input
                    id="backgroundVideo"
                    value={content.header.backgroundVideo}
                    onChange={(e) => updateContent('header.backgroundVideo', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Our Story Tab */}
        <TabsContent value="story" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Story Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="storyTitle">Section Title</Label>
                  <Input
                    id="storyTitle"
                    value={content.sections.ourStory.title}
                    onChange={(e) => updateContent('sections.ourStory.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="storyIcon">Icon</Label>
                  <Select
                    value={content.sections.ourStory.icon}
                    onValueChange={(value) => updateContent('sections.ourStory.icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="storyIconColor">Icon Color</Label>
                  <Select
                    value={content.sections.ourStory.iconColor}
                    onValueChange={(value) => updateContent('sections.ourStory.iconColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="storyContent">Story Content</Label>
                <Textarea
                  id="storyContent"
                  rows={4}
                  value={content.sections.ourStory.content}
                  onChange={(e) => updateContent('sections.ourStory.content', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* What Makes Us Special Tab */}
        <TabsContent value="special" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>What Makes Us Special Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="specialTitle">Section Title</Label>
                  <Input
                    id="specialTitle"
                    value={content.sections.whatMakesUsSpecial.title}
                    onChange={(e) => updateContent('sections.whatMakesUsSpecial.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="specialIcon">Icon</Label>
                  <Select
                    value={content.sections.whatMakesUsSpecial.icon}
                    onValueChange={(value) => updateContent('sections.whatMakesUsSpecial.icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="specialIconColor">Icon Color</Label>
                  <Select
                    value={content.sections.whatMakesUsSpecial.iconColor}
                    onValueChange={(value) => updateContent('sections.whatMakesUsSpecial.iconColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Features</h3>
                <div className="space-y-4">
                  {content.sections.whatMakesUsSpecial.features.map((feature, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <Label>Feature Title</Label>
                            <Input
                              value={feature.title}
                              onChange={(e) => updateFeature(index, 'title', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Icon</Label>
                            <Select
                              value={feature.icon}
                              onValueChange={(value) => updateFeature(index, 'icon', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map((icon) => (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    {icon.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Icon Color</Label>
                            <Select
                              value={feature.iconColor}
                              onValueChange={(value) => updateFeature(index, 'iconColor', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {colorOptions.map((color) => (
                                  <SelectItem key={color.value} value={color.value}>
                                    {color.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              rows={2}
                              value={feature.description}
                              onChange={(e) => updateFeature(index, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visit Us Tab */}
        <TabsContent value="visit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Us Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="visitTitle">Section Title</Label>
                  <Input
                    id="visitTitle"
                    value={content.sections.visitUs.title}
                    onChange={(e) => updateContent('sections.visitUs.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="visitIcon">Icon</Label>
                  <Select
                    value={content.sections.visitUs.icon}
                    onValueChange={(value) => updateContent('sections.visitUs.icon', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          {icon.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="visitIconColor">Icon Color</Label>
                  <Select
                    value={content.sections.visitUs.iconColor}
                    onValueChange={(value) => updateContent('sections.visitUs.iconColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          {color.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <div className="space-y-2">
                  {content.sections.visitUs.location.address.map((line, index) => (
                    <Input
                      key={index}
                      value={line}
                      onChange={(e) => {
                        const newAddress = [...content.sections.visitUs.location.address];
                        newAddress[index] = e.target.value;
                        updateContent('sections.visitUs.location.address', newAddress);
                      }}
                      placeholder={`Address Line ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={content.sections.visitUs.contact.phone.number}
                      onChange={(e) => updateContent('sections.visitUs.contact.phone.number', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={content.sections.visitUs.contact.email.address}
                      onChange={(e) => updateContent('sections.visitUs.contact.email.address', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Opening Hours</h3>
                <div className="space-y-3">
                  {content.sections.visitUs.hours.schedule.map((schedule, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Days</Label>
                        <Input
                          value={schedule.days}
                          onChange={(e) => updateSchedule(index, 'days', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Time</Label>
                        <Input
                          value={schedule.time}
                          onChange={(e) => updateSchedule(index, 'time', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Our Mission Tab */}
        <TabsContent value="mission" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="missionTitle">Section Title</Label>
                  <Input
                    id="missionTitle"
                    value={content.sections.ourMission.title}
                    onChange={(e) => updateContent('sections.ourMission.title', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="missionTextColor">Title Color</Label>
                  <Select
                    value={content.sections.ourMission.textColor}
                    onValueChange={(value) => updateContent('sections.ourMission.textColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-yellow-200">Yellow 200</SelectItem>
                      <SelectItem value="text-white">White</SelectItem>
                      <SelectItem value="text-blue-200">Blue 200</SelectItem>
                      <SelectItem value="text-green-200">Green 200</SelectItem>
                      <SelectItem value="text-purple-200">Purple 200</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="missionContentColor">Content Color</Label>
                  <Select
                    value={content.sections.ourMission.contentColor}
                    onValueChange={(value) => updateContent('sections.ourMission.contentColor', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-yellow-100/90">Yellow 100/90</SelectItem>
                      <SelectItem value="text-white/90">White/90</SelectItem>
                      <SelectItem value="text-blue-100/90">Blue 100/90</SelectItem>
                      <SelectItem value="text-green-100/90">Green 100/90</SelectItem>
                      <SelectItem value="text-purple-100/90">Purple 100/90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="missionContent">Mission Statement</Label>
                <Textarea
                  id="missionContent"
                  rows={4}
                  value={content.sections.ourMission.content}
                  onChange={(e) => updateContent('sections.ourMission.content', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
