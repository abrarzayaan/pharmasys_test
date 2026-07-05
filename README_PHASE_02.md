# PharmaSys-P2: Product & Inventory Module Documentation

This document serves as a complete development reference for the **Product and Inventory Module** of the PharmaSys project. It captures the entire architecture, step-by-step development lifecycle, file structures, and critical structural troubleshooting from the `PharmaSys-P2` development session. 

---

## 1. Project Context & Architecture Strategy
The primary goal of this phase was to design a robust, scalable, and modular backend system for an advanced Pharmaceutical Management E-commerce platform. 

### Core Architectural Decisions:
*   **Modular Monolith Strategy:** To keep the project maintainable, all standalone features are modularized as individual Django apps inside a dedicated `apps/` directory.
*   **Django Custom User Integration:** System authentication relies on a custom user model extending `AbstractUser`.
*   **DRF & Swagger Ecosystem:** The system uses Django REST Framework (DRF) paired with an automated documentation tool (`drf-yasg` or `drf-spectacular`) for API routing and exploration.

---

## 2. Step-by-Step Development Lifecycle

### Step 1: Schema Design & Database Modeling
We engineered a highly normalized, relational data model capable of handling variations, attributes, and precise inventory levels across dynamic batch numbers.
*   **Target Files Created:** `apps/products/models.py`
*   **Entities Modeled:**
    1.  `Category` & `Brand` (Hierarchical taxonomy)
    2.  `Product` (Core details: generic name, indications, prescription-only flags)
    3.  `ProductVariant` (SKU management, strengths like 500mg, 20ml)
    4.  `ProductImage` (Multi-image relational mapping)
    5.  `ProductAttribute` & `ProductAttributeValue` (Flexible specs like packaging: Strip, Box)
    6.  `Inventory` (Real-time stock tracking, batch control, and expiry alert triggers)

### Step 2: Data Serialization & Validation Layers
To secure and structure incoming payloads, we separated serializers into targeted operational files inside a structured directory.
*   **Target Directory:** `apps/products/serializers/`
*   **File Tree & Domain Responsibilities:**
    *   `__init__.py`: Exposed clean endpoints for app-level exposure.
    *   `category_brand.py`: `CategorySerializer`, `BrandSerializer`.
    *   `product_core.py`: `ProductSerializer` (Handles primary medical parameters).
    *   `variants_images.py`: `ProductVariantSerializer`, `ProductImageSerializer`.
    *   `attributes.py`: Dynamic options serialization.
    *   `inventories.py`: Strict batch validation, tracking manufacture vs. expiry matrices.

### Step 3: Controller Layer (REST Views & ViewSets)
Implemented uniform RESTful patterns utilizing DRF `ModelViewSet` to handle CRUD operations natively with minimal boilerplate.
*   **Target Directory:** `apps/products/views/`
*   **File Tree & Domain Responsibilities:**
    *   `__init__.py`: Combined entry point for exposure.
    *   `category_brand.py`: `CategoryViewSet`, `BrandViewSet`.
    *   `product_core.py`: `ProductViewSet`.
    *   `variants_images.py`: Viewsets for media management.
    *   `attributes.py`: Viewsets for variant specs.
    *   `inventories.py`: Advanced stock querying hooks.

### Step 4: Routing & Global Endpoint Exposure
Wiring the isolated app-level router back into the project's centralized core ecosystem.
*   **App Router:** `apps/products/urls.py` (Registers `DefaultRouter` for all views with precise `basename` tags).
*   **Global Project Router:** `core/urls.py` (Includes the product app with an isolated namespace via `path('api/products/', include('apps.products.urls'))`).

### Step 5: Administration Interface Tuning
Customizing the local dashboard representation for data entries.
*   **Target Files Updated:** `apps/products/admin.py` (Registered all 8 primary models for backend management).

---

## 3. Structural Troubleshooting & Critical Bug Fixes

During integration, the system threw deep `ModuleNotFoundError` crashes. Documenting these resolutions is critical for downstream AI context.

### The Absolute Path Rule (`apps.` Prefix)
*   **The Issue:** The project uses a sub-folder hierarchy (`apps/`). Legacy or default scaffolding caused absolute imports to execute as `from products.models import...`. Python lookups failed because `products` does not live at the root layer.
*   **The Resolution:** Every inter-app import must explicitly route through the `apps` root directory.
*   *Correction Reference 1 (`apps/products/admin.py`):* Changed from `products.models` to `apps.products.models`.
*   *Correction Reference 2 (`apps/products/serializers/category_brand.py`):* Fixed breaking exception by updating to `from apps.products.models import Category, Brand`.

### Swagger Endpoint Ghosting Fix
*   **The Issue:** The backend execution was successful, but new Product API segments failed to load on the Swagger layout UI.
*   **The Resolution:** 
    1. Verified router registration mapping inside `core/urls.py`.
    2. Checked `get_schema_view` validation blocks to ensure `public=True` flag visibility wasn't locking down pattern matching scopes.

---

## 4. How to Use this Context File with AI Agents
When initializing a new session or onboarding a secondary agent for `PharmaSys-P2`, prompt the agent with the following snippet:

> *"Please read this README.md context carefully. I am developing the 'PharmaSys-P2' backend module. All business logic must live inside an explicit `apps/` layout. Use strict absolute path routing prefixed with `apps.[app_name]`. Ensure all DRF Viewsets utilize strict explicit `basename` declarations for auto-generation mapping within the core API schema layout."*