import React, { useState } from 'react';
import {
  PlusCircle,
  TagPlus,
  PackagePlus,
  FolderPlus,
  Building2,
  Boxes,
  ImagePlus,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CategoryCreateForm } from '../components/creation/CategoryCreateForm';
import { ProductCreateForm } from '../components/creation/ProductCreateForm';
import { VariantCreateForm } from '../components/creation/VariantCreateForm';
import { ImageUploadForm } from '../components/creation/ImageUploadForm';
import { BrandCreateForm } from '../components/creation/BrandCreateForm';
import { InventoryCreateForm } from '../components/creation/InventoryCreateForm';

export const MasterCreationHubPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState<
    'variant' | 'product' | 'category' | 'brand' | 'inventory' | 'image'
  >('variant');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-emerald-400">
            <PlusCircle className="w-4 h-4" />
            <span>SECTION 00 — UNIFIED MASTER CREATION HUB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-head font-bold text-content-primary tracking-tight">
            Master Catalog & Entry Management
          </h1>
          <p className="text-xs sm:text-sm text-content-secondary mt-1">
            Replaces default Django Admin forms with a modern, dynamic UI for Categories, Products, Variants, Brands, Inventories & Meta JSON fields.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/catalog')}
          className="px-4 py-2.5 rounded-xl bg-bg-card hover:bg-bg-hover border border-bg-border text-content-primary text-xs font-bold flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <span>Go to Catalog & Pricing Table</span>
          <ArrowRight className="w-4 h-4 text-primary-400" />
        </button>
      </div>

      {/* Step Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Step 1: Variant */}
        <button
          onClick={() => setActiveStep('variant')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeStep === 'variant'
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-glow'
              : 'bg-bg-card border-bg-border text-content-muted hover:bg-bg-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <TagPlus className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
              STEP 1
            </span>
          </div>
          <div className="mt-2 font-head font-bold text-xs text-content-primary">Variant & Meta</div>
          <div className="text-[10px] text-content-muted">Prices & Specs</div>
        </button>

        {/* Step 2: Product */}
        <button
          onClick={() => setActiveStep('product')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeStep === 'product'
              ? 'bg-accent-500/10 border-accent-500/50 text-accent-400 shadow-glow'
              : 'bg-bg-card border-bg-border text-content-muted hover:bg-bg-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <PackagePlus className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-400">
              STEP 2
            </span>
          </div>
          <div className="mt-2 font-head font-bold text-xs text-content-primary">Product Master</div>
          <div className="text-[10px] text-content-muted">Generic & Rx</div>
        </button>

        {/* Step 3: Category */}
        <button
          onClick={() => setActiveStep('category')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeStep === 'category'
              ? 'bg-primary-500/10 border-primary-500/50 text-primary-400 shadow-glow'
              : 'bg-bg-card border-bg-border text-content-muted hover:bg-bg-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <FolderPlus className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-400">
              STEP 3
            </span>
          </div>
          <div className="mt-2 font-head font-bold text-xs text-content-primary">Category</div>
          <div className="text-[10px] text-content-muted">Hierarchies</div>
        </button>

        {/* Step 4: Brand */}
        <button
          onClick={() => setActiveStep('brand')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeStep === 'brand'
              ? 'bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-glow'
              : 'bg-bg-card border-bg-border text-content-muted hover:bg-bg-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <Building2 className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
              STEP 4
            </span>
          </div>
          <div className="mt-2 font-head font-bold text-xs text-content-primary">Brand / Pharma</div>
          <div className="text-[10px] text-content-muted">Manufacturers</div>
        </button>

        {/* Step 5: Inventory */}
        <button
          onClick={() => setActiveStep('inventory')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeStep === 'inventory'
              ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 shadow-glow'
              : 'bg-bg-card border-bg-border text-content-muted hover:bg-bg-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <Boxes className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
              STEP 5
            </span>
          </div>
          <div className="mt-2 font-head font-bold text-xs text-content-primary">Stock Setup</div>
          <div className="text-[10px] text-content-muted">Batch & Alerts</div>
        </button>

        {/* Step 6: Image */}
        <button
          onClick={() => setActiveStep('image')}
          className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
            activeStep === 'image'
              ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-glow'
              : 'bg-bg-card border-bg-border text-content-muted hover:bg-bg-hover'
          }`}
        >
          <div className="flex items-center justify-between">
            <ImagePlus className="w-4 h-4" />
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
              STEP 6
            </span>
          </div>
          <div className="mt-2 font-head font-bold text-xs text-content-primary">Gallery Image</div>
          <div className="text-[10px] text-content-muted">Photos & Thumbs</div>
        </button>
      </div>

      {/* ACTIVE STEP CONTENT */}
      {activeStep === 'variant' && (
        <VariantCreateForm onSuccess={() => navigate('/admin/catalog')} />
      )}

      {activeStep === 'product' && (
        <ProductCreateForm onSuccess={() => setActiveStep('variant')} />
      )}

      {activeStep === 'category' && (
        <CategoryCreateForm onSuccess={() => setActiveStep('product')} />
      )}

      {activeStep === 'brand' && (
        <BrandCreateForm onSuccess={() => setActiveStep('product')} />
      )}

      {activeStep === 'inventory' && (
        <InventoryCreateForm onSuccess={() => navigate('/admin/catalog')} />
      )}

      {activeStep === 'image' && (
        <ImageUploadForm />
      )}
    </div>
  );
};
