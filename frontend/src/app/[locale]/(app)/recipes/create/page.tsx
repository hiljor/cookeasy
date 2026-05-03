"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/form/Button";
import { Input } from "@/components/ui/form/Input";
import { toast } from "sonner";
import { Image as ImageIcon, Plus, Trash2, Lock, Globe } from "lucide-react";

export default function CreateRecipePage() {
  const t = useTranslations("Recipes.create");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: [""],
    prep_time: 0,
    cook_time: 0,
    servings: 1,
    is_private: false,
    ingredients: [{ name: "", quantity: 0, unit: "" }],
    tags: [] as string[]
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/recipes/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create recipe");
      
      toast.success("Recipe created successfully!");
      router.push("/recipes");
    } catch (e) {
      toast.error("Failed to create recipe");
      console.error(e);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 pb-32">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-48 h-48 bg-card border border-border rounded-xl flex items-center justify-center cursor-pointer hover:bg-card/80 transition-colors overflow-hidden shrink-0">
          <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
          <label htmlFor="image-upload" className="w-full h-full flex items-center justify-center cursor-pointer">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="h-10 w-10 text-muted" />
            )}
          </label>
        </div>
        <div className="flex-1 flex flex-col justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Input 
              placeholder={t("fields.title")}
              className="text-2xl sm:text-2xl font-extrabold border-2 border-[var(--color-primary)] bg-[var(--color-card)] px-4 py-4 rounded-xl focus:ring-2 focus:ring-[var(--color-primary-light)] placeholder:text-muted/50 flex-1"
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
            {/* Visibility Slider */}
            <div className="flex items-center gap-3 bg-[var(--color-card)] border border-[var(--color-border)] p-1 rounded-full h-fit">
              <button
                type="button"
                onClick={() => setFormData({...formData, is_private: false})}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${!formData.is_private ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-muted hover:bg-[var(--color-border)]/50'}`}
                title={t("visibility.public")}
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("visibility.public")}</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, is_private: true})}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${formData.is_private ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-muted hover:bg-[var(--color-border)]/50'}`}
                title={t("visibility.private")}
              >
                <Lock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">{t("visibility.private")}</span>
              </button>
            </div>
          </div>
          <textarea
            placeholder={t("fields.description")}
            className="w-full h-24 p-3 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>
      </div>

      {/* Main Content: Desktop Two-Columns / Mobile Tabs */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Mobile Tabs */}
        <div className="flex md:hidden border-b border-[var(--color-border)] mb-4">
          <button 
            className={`flex-1 py-2 font-medium ${activeTab === 'ingredients' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-muted'}`}
            onClick={() => setActiveTab('ingredients')}
          >{t("fields.ingredients")}</button>
          <button 
            className={`flex-1 py-2 font-medium ${activeTab === 'steps' ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]' : 'text-muted'}`}
            onClick={() => setActiveTab('steps')}
          >{t("fields.steps")}</button>
        </div>

        {/* Ingredients Column */}
        <div className={`${activeTab === 'ingredients' ? 'block' : 'hidden md:block'} space-y-4`}>
          <h3 className="font-semibold text-lg text-[var(--color-foreground)]">{t("fields.ingredients")}</h3>
          {formData.ingredients.map((ing, idx) => (
            <div key={idx} className="flex gap-2">
              <Input 
                placeholder={t("fields.qty")} 
                className="w-16 border-[var(--color-border)] bg-[var(--color-card)] focus:border-[var(--color-primary)]"
                value={ing.quantity || ""} 
                onChange={(e) => {
                  const newIng = [...formData.ingredients];
                  newIng[idx].quantity = parseFloat(e.target.value) || 0;
                  setFormData({...formData, ingredients: newIng});
                }} 
              />
              <Input 
                placeholder={t("fields.unit")} 
                className="w-20 border-[var(--color-border)] bg-[var(--color-card)] focus:border-[var(--color-primary)]"
                value={ing.unit} 
                onChange={(e) => {
                  const newIng = [...formData.ingredients];
                  newIng[idx].unit = e.target.value;
                  setFormData({...formData, ingredients: newIng});
                }} 
              />
              <Input 
                placeholder={t("fields.ingredientPlaceholder")} 
                className="flex-1 border-[var(--color-border)] bg-[var(--color-card)] focus:border-[var(--color-primary)]"
                value={ing.name} 
                onChange={(e) => {
                 const newIng = [...formData.ingredients];
                 newIng[idx].name = e.target.value;
                 setFormData({...formData, ingredients: newIng});
              }} />
              <Button variant="ghost" size="sm" className="text-muted hover:text-red-500" onClick={() => {
                setFormData({...formData, ingredients: formData.ingredients.filter((_, i) => i !== idx)});
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => setFormData({...formData, ingredients: [...formData.ingredients, { name: "", quantity: 0, unit: "" }]})}>
            <Plus className="h-4 w-4 mr-2" /> {t("fields.addIngredient")}
          </Button>
        </div>

        {/* Steps Column */}
        <div className={`${activeTab === 'steps' ? 'block' : 'hidden md:block'} space-y-4`}>
          <h3 className="font-semibold text-lg">{t("fields.steps")}</h3>
          {formData.instructions.map((step, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-muted pt-2">{idx + 1}.</span>
              <textarea
                className="w-full p-2 rounded bg-card border border-border"
                value={step}
                onChange={(e) => {
                  const newIns = [...formData.instructions];
                  newIns[idx] = e.target.value;
                  setFormData({...formData, instructions: newIns});
                }}
              />
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={() => setFormData({...formData, instructions: [...formData.instructions, ""]})}>
            <Plus className="h-4 w-4 mr-2" /> {t("fields.addStep")}
          </Button>
        </div>
      </div>

      {/* Fixed Footer Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--color-primary)] border-t border-[var(--color-primary-dark)] p-4 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex justify-end px-4 sm:px-8">
          <Button 
            size="lg" 
            onClick={handleSubmit}
            className="bg-[var(--color-primary-verydark)] text-white hover:bg-black border-none shadow-lg font-bold px-10"
          >
            {t("submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
