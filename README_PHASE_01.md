# 💊 PharmaSys - Backend Architecture Blueprint (Phase 1)

এই ডকুমেন্টটি **PharmaSys** প্রজেক্টের Phase 1 (Authentication, Role-based Profiles, এবং Address Management)-এর একটি কমপ্লিট ডেভেলপমেন্ট হিস্ট্রি এবং টেকনিক্যাল রানবুক। কোডের পুনরাবৃত্তি না করে, এখানে আমাদের কাজের সিকোয়েন্স, লজিক্যাল ডিসিশন এবং ফাইল রেফারেন্সগুলো ধাপে ধাপে সাজানো হয়েছে, যাতে যেকোনো এআই এজেন্ট বা ডেভেলপার পরবর্তী মডিউল (ক্যাটালগ, কার্ট, অর্ডার) বিল্ড করার সময় এটিকে গ্লোবাল গাইডলাইন হিসেবে ব্যবহার করতে পারে।

---

## 🧭 Step-by-Step Development Journey (আমরা যেভাবে কাজ করেছি)

### ধাপ ১: কাস্টম ইউজার ও রোল ইঞ্জিন ডিজাইন
* **সিদ্ধান্ত:** ই-কমার্সের স্ট্যান্ডার্ড অনুযায়ী ফোন নম্বরকে ইউনিক আইডেন্টিফায়ার ধরে কাস্টম ইউজার মডেল তৈরি করা হয়েছে।
* **রোল টেবিল বিচ্ছিন্নকরণ:** হার্ডকোড চয়েস ফিল্ড ব্যবহার না করে `Role` এবং `UserRole` টেবিলের মাধ্যমে `consumer`, `vendor`, এবং `rider` রোলগুলোকে ডায়নামিক করা হয়েছে।
* **ফাইল রেফারেন্স:** `apps/authentication/models.py`

### ধাপ ২: ডাটা ইন্টিগ্রিটি ও অটো-প্রোফাইল ক্রিয়েশন লজিক
* **সমস্যা:** রেজিস্ট্রেশনের পর প্রোফাইল টেবিলে ডাটা ম্যানুয়ালি ক্রিয়েট করতে গেলে ডাটা মিসম্যাচ হওয়ার রিস্ক থাকে।
* **সমাধান:** রেজিস্ট্রেশন সিরিয়ালাইজারের ভেতর ডাটাবেজ ট্রানজেকশন `with transaction.atomic()` ব্লক ব্যবহার করা হয়েছে। ইউজার সাইন-আপ করার সাথে সাথেই ব্যাকএন্ড তার জন্য একটি খালি প্রোফাইল রো (Row) তৈরি করে দেয় যেখানে বাকি ফিল্ডগুলো `NULL` থাকে।
* **রোল ক্লিনিং:** ফ্রন্টএন্ড থেকে আসা রোলের নামকে কেস-সেন্সিটিভিটি বাগ থেকে বাঁচাতে `.strip().lower()` ফিল্টারিং লেয়ার যুক্ত করা হয়েছে।
* **ফাইল রেফারেন্স:** `apps/authentication/serializers.py`

### ধাপ ৩: কাস্টম JWT পে-লোড কাস্টমাইজেশন
* **সিদ্ধান্ত:** প্রতিবার রিকোয়েস্টে রোলের জন্য ডাটাবেজে অতিরিক্ত কোয়েরি করা এড়াতে `SimpleJWT` এর টোকেন কাস্টমাইজ করা হয়েছে। অ্যাক্সেস টোকেনের ডিক্রিপ্টেড পে-লোডের ভেতরেই ইউজারের `role` এবং `phone` পুশ করা হয়েছে।
* **ফাইল রেফারেন্স:** `apps/authentication/serializers.py` (CustomTokenSerializer) & `apps/authentication/views.py`

### ধাপ ৪: কঠোর পারমিশন গার্ড (Security Layer)
* **সিদ্ধান্ত:** কোন ইউজার কোন এপিআই এন্ডপয়েন্ট হিট করতে পারবে তা গ্লোবাল পারমিশন ক্লাস দিয়ে লক করা হয়েছে। টোকেনের ভেতরের রোল চেক করে `IsConsumer`, `IsVendor`, এবং `IsRider` পারমিশন গার্ড তৈরি করা হয়েছে।
* **ফাইল রেফারেন্স:** `apps/profiles/permissions.py`

### ধাপ ৫: প্রোফাইল আপডেট ও পারশিয়াল এডিটিং (PATCH)
* **সিদ্ধান্ত:** প্রোফাইল আপডেটের জন্য আলাদা আলাদা ভিউ তৈরি করা হয়েছে এবং `partial=True` নিশ্চিত করা হয়েছে, যাতে ফ্রন্টএন্ড থেকে শুধু পরিবর্তিত ফিল্ডটুকু পাঠালেই ডাটাবেজ আপডেট হয়ে যায়।
* **ফাইল রেফারেন্স:** `apps/profiles/views.py` & `apps/profiles/serializers.py`

### ধাপ ৬: প্রোডাকশন-রেডি অ্যাড্রেস বুক ও সিকিউরিটি লজিক
* **আর্কিটেকচারাল সিদ্ধান্ত:** একটি ইউজারের একাধিক অ্যাড্রেস (Home, Office, Pharmacy) থাকতে পারে। তাই অর্ডার প্লেসের সময় ঝামেলা এড়াতে অ্যাড্রেস বুককে ইউনিক `id` (Address ID) এর সাপেক্ষে আপডেট ও ডিলিট করার লজিক দেওয়া হয়েছে।
* **মালিকানা ভ্যালিডেশন:** অন্য ইউজার যেন অন্যের অ্যাড্রেস আইডি দিয়ে ডাটা হ্যাক বা এডিট করতে না পারে, সেজন্য ভিউ লেভেলে `get_queryset` মেথডে `filter(user=request.user)` দিয়ে কোয়েরি লক করা হয়েছে।
* **সফট ডিলিট:** ডাটাবেজ থেকে ডাটা পার্মানেন্টলি মুছে না ফেলে সুরক্ষার স্বার্থে স্ট্যাটাস `hidden` করার লজিক দেওয়া হয়েছে।
* **ফাইল রেফারেন্স:** `apps/profiles/views.py` (UserAddressListCreateView, UserAddressDetailView) & `apps/profiles/models.py`

---
🔑 Core API Endpoints Reference
যেকোনো নতুন চ্যাটে এআই এজেন্ট যেন এই এন্ডপয়েন্টগুলোর ব্যবহার বুঝতে পারে:

POST /api/auth/register/ -> নতুন ইউজার তৈরি ও অটো প্রোফাইল জেনারেশন।

POST /api/auth/login/ -> রোল-অ্যাম্বেডেড সিকিউর টোকেন রিট্রিভ করা।

PATCH /api/profiles/consumer/update/ -> কাস্টমার প্রোফাইল এডিট।

PATCH /api/profiles/vendor/update/ -> ভেন্ডর শপ প্রোফাইল ও মেটা আপডেট।

GET / POST /api/profiles/addresses/ -> ইউজারের নিজস্ব একটিভ অ্যাড্রেস লিস্ট এবং নতুন অ্যাড্রেস যোগ করা।

PATCH / DELETE /api/profiles/addresses/<id>/ -> সুনির্দিষ্ট অ্যাড্রেস আইডি ধরে এডিট এবং সফট-ডিলিট (status='hidden') করা।

💡 Instruction for Future AI Agent: যখনই এই প্রজেক্টের পরবর্তী মডিউল (যেমন: প্রোডাক্ট ক্যাটালগ বা ইনভেন্টরি) নিয়ে কাজ করবে, তখন ইনভেন্টরি বা অর্ডারের মালিকানা ট্র্যাক করতে এই ব্লুপ্রিন্টের request.user.vendor_profile অথবা Address.objects.filter(user=request.user) লজিকটি অনুসরণ করবে।


## 🗂️ Complete Directory & File Reference Map

পরবর্তী কাজের সুবিধার্থে নিচে ফেজে-১ এর ফাইল স্ট্রাকচার এবং কোন ফাইলে কী মেকানিজম আছে তা দেওয়া হলো:

```text
📁 core/
└── 📄 settings.py          # INSTALLED_APPS এ 'apps.authentication' ও 'apps.profiles' কনফিগারেশন।
└── 📄 urls.py              # গ্লোবাল এপিআই রাউটিং ম্যাপ (/api/auth/ এবং /api/profiles/)।

📁 apps/
├── 📁 authentication/
│   ├── 📄 models.py        # CustomUser, Role, UserRole মডেল।
│   ├── 📄 serializers.py   # RegisterSerializer (Atomic), LoginSerializer, CustomTokenSerializer (JWT)।
│   └── 📄 views.py         # RegisterView, LoginView, CustomTokenView।
│
└── 📁 profiles/
    ├── 📄 models.py        # Address, ConsumerProfile, VendorProfile, RiderProfile মডেল।
    ├── 📄 permissions.py   # IsConsumer, IsVendor, IsRider কাস্টম পারমিশন লেয়ার।
    ├── 📄 serializers.py   # প্রোফাইল ও অ্যাড্রেসের ইনপুট-আউটপুট সিরিয়ালাইজার।
    └── 📄 views.py         # Profile Update Views এবং Address List, Create, Detail (Soft-delete) Views।