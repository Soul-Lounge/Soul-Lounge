import { useEffect, useMemo, useState } from "react";
import logoImage from "../logo.jpg";

type MenuCategory = "all" | "burgers" | "texmex" | "mains" | "sides" | "desserts" | "drinks";
type OrderMode = "delivery" | "pickup";
type CheckoutStatus = "idle" | "payu" | "success" | "failure";
type ToastKind = "success" | "error" | "info";

type MenuItem = {
  id: string;
  category: Exclude<MenuCategory, "all">;
  label: string;
  title: string;
  description: string;
  price: number;
  image: string;
  alt: string;
  featured?: boolean;
};

type CartItem = {
  id: string;
  quantity: number;
};

type CartLine = {
  item: MenuItem;
  quantity: number;
};

type OrderForm = {
  customer: string;
  phone: string;
  address: string;
  addressStreet: string;
  addressNumber: string;
  addressApartment: string;
  addressCity: string;
  pickupTime: string;
  notes: string;
};

type SubmittedOrder = {
  id: string;
  mode: OrderMode;
  customer: string;
  phone: string;
  address: string;
  pickupTime: string;
  notes: string;
  lines: CartLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  etaMinutes: number;
  createdAt: string;
};

type PayUResult = {
  orderId?: string;
  redirectUri?: string;
  status?: string;
};

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type SpecialItem = {
  label: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

type OpeningHour = {
  day: number;
  label: string;
  hours: string;
};

const categories: Array<{ id: MenuCategory; label: string }> = [
  { id: "all", label: "Wszystko" },
  { id: "burgers", label: "Burgery" },
  { id: "texmex", label: "Tex-Mex" },
  { id: "mains", label: "Dania główne" },
  { id: "sides", label: "Przekąski" },
  { id: "desserts", label: "Desery" },
  { id: "drinks", label: "Drinki" },
];

const stockImages = {
  heroRibs: "https://images.pexels.com/photos/18824021/pexels-photo-18824021.jpeg?auto=compress&cs=tinysrgb&w=2400",
  burger: "https://images.pexels.com/photos/21820166/pexels-photo-21820166.jpeg?auto=compress&cs=tinysrgb&w=1400",
  burgerAlt: "https://images.pexels.com/photos/28828555/pexels-photo-28828555.jpeg?auto=compress&cs=tinysrgb&w=1400",
  fajitas: "https://images.pexels.com/photos/32371275/pexels-photo-32371275.jpeg?auto=compress&cs=tinysrgb&w=1400",
  nachos: "https://images.pexels.com/photos/29851128/pexels-photo-29851128.jpeg?auto=compress&cs=tinysrgb&w=1400",
  ribs: "https://images.pexels.com/photos/4253617/pexels-photo-4253617.jpeg?auto=compress&cs=tinysrgb&w=1400",
  fishAndChips: "https://images.pexels.com/photos/30910480/pexels-photo-30910480.jpeg?auto=compress&cs=tinysrgb&w=1400",
  wings: "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=1400",
  fries: "https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=1400",
  cocktails: "https://images.pexels.com/photos/33231324/pexels-photo-33231324.jpeg?auto=compress&cs=tinysrgb&w=1400",
  lemonade: "https://images.pexels.com/photos/128242/pexels-photo-128242.jpeg?auto=compress&cs=tinysrgb&w=1400",
  party: "https://images.pexels.com/photos/32371275/pexels-photo-32371275.jpeg?auto=compress&cs=tinysrgb&w=1400",
  steak: "https://images.pexels.com/photos/3535383/pexels-photo-3535383.jpeg?auto=compress&cs=tinysrgb&w=1400",
  dessert: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=1400",
  restaurant: "https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1800",
} as const;

const menuItems: MenuItem[] = [
  {
    id: "jack-daniels-bbq",
    category: "burgers",
    label: "Burgery",
    title: "Jack Daniels BBQ",
    description: "Wołowina, cheddar, boczek, sos BBQ, pikle i czerwona cebula.",
    price: 42,
    image: stockImages.burger,
    alt: "Soczysty cheeseburger na ciemnym tle",
    featured: true,
  },
  {
    id: "lumberjack",
    category: "burgers",
    label: "Burgery",
    title: "Lumberjack",
    description: "Wołowina, cheddar, kotlet serowy, boczek, sałata i sos 1000 wysp.",
    price: 46,
    image: stockImages.burgerAlt,
    alt: "Burger z frytkami w ciemnym klimacie restauracyjnym",
  },
  {
    id: "american-star",
    category: "burgers",
    label: "Burgery",
    title: "American Star",
    description: "Polędwiczki z kurczaka, sałata, pomidor, ogórek i majonez.",
    price: 38,
    image: stockImages.burger,
    alt: "Burger z serem i warzywami",
  },
  {
    id: "fajitas",
    category: "texmex",
    label: "Tex-Mex",
    title: "Fajitas",
    description: "Grillowany kurczak, papryka, cebula, tortilla i kwaśna śmietana.",
    price: 49,
    image: stockImages.fajitas,
    alt: "Kolorowe fajitas z kurczakiem, papryką i tortillami",
  },
  {
    id: "nachos",
    category: "texmex",
    label: "Mexico",
    title: "Nachos",
    description: "Chrupiące nachos z mięsem, jalapeno, awokado, salsą i kwaśną śmietaną.",
    price: 34,
    image: stockImages.nachos,
    alt: "Nachos z dodatkami Tex-Mex na drewnianym stole",
  },
  {
    id: "burrito",
    category: "texmex",
    label: "Mexico",
    title: "Burrito",
    description: "Grillowana tortilla z chilli con carne, serem mozzarella, guacamole i śmietaną.",
    price: 39,
    image: stockImages.fajitas,
    alt: "Tex-Mex tortilla z grillowanym kurczakiem i warzywami",
  },
  {
    id: "quesadilla",
    category: "texmex",
    label: "Mexico",
    title: "Quesadilla",
    description: "Tortilla zapiekana z mozzarellą, kurczakiem, papryką, kukurydzą i sosem.",
    price: 36,
    image: stockImages.nachos,
    alt: "Tex-Mex nachos i dodatki na stole",
  },
  {
    id: "ribs",
    category: "mains",
    label: "BBQ",
    title: "Żeberka",
    description: "Sos BBQ, teriyaki albo miodowo-musztardowy, ziemniaczki i colesław.",
    price: 58,
    image: stockImages.ribs,
    alt: "Grillowane żeberka BBQ podawane na stole",
  },
  {
    id: "chicken-breast",
    category: "mains",
    label: "Klasyki",
    title: "Chicken Breast",
    description: "Grillowane polędwiczki z kurczaka w sosie miodowo-musztardowym z frytkami.",
    price: 44,
    image: stockImages.fajitas,
    alt: "Grillowany kurczak z papryką i dodatkami",
  },
  {
    id: "fish-and-chips",
    category: "mains",
    label: "Klasyki",
    title: "Fish & Chips",
    description: "Smażone kawałki ryby w panierce, frytki i sos tatarski.",
    price: 43,
    image: stockImages.fishAndChips,
    alt: "Fish and chips z frytkami i sosem",
  },
  {
    id: "buffalo-wings",
    category: "sides",
    label: "Przekąski",
    title: "Buffalo Wings",
    description: "Skrzydełka z kurczaka w sosie ostrym, serowym albo BBQ z selerem naciowym.",
    price: 31,
    image: stockImages.wings,
    alt: "Skrzydełka buffalo z sosem",
  },
  {
    id: "loaded-fries",
    category: "sides",
    label: "Przekąski",
    title: "Loaded Fries",
    description: "Frytki z jalapeno, serem, bekonem, sosem chilli i cebulką.",
    price: 27,
    image: stockImages.fries,
    alt: "Frytki w koszyku z dodatkami",
  },
  {
    id: "cheesecake",
    category: "desserts",
    label: "Desery",
    title: "Sernik nowojorski",
    description: "Kremowy sernik z owocami i słodkim sosem.",
    price: 24,
    image: stockImages.dessert,
    alt: "Kawałek cheesecake z owocami",
  },
  {
    id: "cuba-libre",
    category: "drinks",
    label: "Bar",
    title: "Cuba Libre",
    description: "Rum, cola, limonka i wieczorowy klimat przy stole.",
    price: 28,
    image: stockImages.cocktails,
    alt: "Kolorowe koktajle na barze",
  },
  {
    id: "lemonade",
    category: "drinks",
    label: "Napoje",
    title: "Lemoniada arbuzowa",
    description: "Domowa lemoniada z arbuzem, cytrusami i lodem.",
    price: 16,
    image: stockImages.lemonade,
    alt: "Orzeźwiająca lemoniada z owocami",
  },
];

const specials: SpecialItem[] = [
  {
    label: "Na ekipę",
    title: "Chilli Party",
    description: "Buffalo wings, stripsy, nachos, quesadilla, frytki i sosy do dzielenia.",
    image: stockImages.party,
    alt: "Sizzling fajitas jako zestaw do dzielenia",
  },
  {
    label: "Special",
    title: "Steak",
    description: "Klasyczna wołowina z sosem, podana w cięższym, południowym stylu.",
    image: stockImages.steak,
    alt: "Grillowany stek na talerzu",
  },
  {
    label: "Na finał",
    title: "Sernik nowojorski",
    description: "Kremowy deser po ostrym Tex-Mexie i dymnym BBQ.",
    image: stockImages.dessert,
    alt: "Kawałek cheesecake z owocami",
  },
];

const openingHours: OpeningHour[] = [
  { day: 1, label: "Poniedziałek", hours: "12:00-21:00" },
  { day: 2, label: "Wtorek", hours: "12:00-21:00" },
  { day: 3, label: "Środa", hours: "12:00-21:00" },
  { day: 4, label: "Czwartek", hours: "12:00-21:00" },
  { day: 5, label: "Piątek", hours: "12:00-24:00" },
  { day: 6, label: "Sobota", hours: "12:00-24:00" },
  { day: 0, label: "Niedziela", hours: "12:00-21:00" },
];

const phoneDisplay = "+48 669 006 181";
const phoneHref = "tel:+48669006181";
const emptyForm: OrderForm = {
  customer: "",
  phone: "",
  address: "",
  addressStreet: "",
  addressNumber: "",
  addressApartment: "",
  addressCity: "",
  pickupTime: "",
  notes: "",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainingSeconds = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function createOrderId() {
  return `SOUL-${Math.floor(100000 + Math.random() * 900000)}`;
}

function isLegionowoAddress(city: string) {
  return /^legionowo$/i.test(city.trim());
}

function createSubmittedOrder({
  cartLines,
  cartTotal,
  deliveryFee,
  finalTotal,
  form,
  orderMode,
}: {
  cartLines: CartLine[];
  cartTotal: number;
  deliveryFee: number;
  finalTotal: number;
  form: OrderForm;
  orderMode: OrderMode;
}) {
  return {
    id: createOrderId(),
    mode: orderMode,
    customer: form.customer,
    phone: form.phone,
    address: orderMode === "delivery"
      ? [form.addressStreet, form.addressNumber, form.addressApartment, form.addressCity].filter(Boolean).join(", ")
      : form.address,
    pickupTime: form.pickupTime,
    notes: form.notes,
    lines: cartLines,
    subtotal: cartTotal,
    deliveryFee,
    total: finalTotal,
    etaMinutes: orderMode === "delivery" ? 45 : 25,
    createdAt: new Date().toLocaleString("pl-PL"),
  };
}

export function App() {
  const [activeCategory, setActiveCategory] = useState<MenuCategory>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutStatus, setCheckoutStatus] = useState<CheckoutStatus>("idle");
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [orderMode, setOrderMode] = useState<OrderMode>("delivery");
  const [submittedOrder, setSubmittedOrder] = useState<SubmittedOrder | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const today = new Date().getDay();
  const todayHours = openingHours.find((item) => item.day === today)?.hours ?? openingHours[0].hours;

  const visibleMenuItems = useMemo(() => {
    if (activeCategory === "all") {
      return menuItems;
    }

    return menuItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const cartLines = useMemo(() => {
    return cart
      .map((cartItem) => {
        const item = menuItems.find((menuItem) => menuItem.id === cartItem.id);
        return item ? { item, quantity: cartItem.quantity } : null;
      })
      .filter((line): line is CartLine => Boolean(line));
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cartLines.reduce((total, line) => total + line.item.price * line.quantity, 0);
  }, [cartLines]);

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const deliveryFee = orderMode === "delivery" && cartTotal > 0 ? 8 : 0;
  const finalTotal = cartTotal + deliveryFee;

  const pushToast = (message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  };

  const addToCart = (id: string) => {
    const menuItem = menuItems.find((item) => item.id === id);
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === id);
      if (existing) {
        return currentCart.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item);
      }

      return [...currentCart, { id, quantity: 1 }];
    });
    pushToast(`${menuItem?.title ?? "Pozycja"} dodane do koszyka`, "success");
  };

  const changeQuantity = (id: string, delta: number) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
        .filter((item) => item.quantity > 0);
    });
  };

  const validateOrder = () => {
    if (cartLines.length === 0) {
      return "Dodaj minimum jedną pozycję do koszyka.";
    }

    if (!form.customer.trim() || !form.phone.trim()) {
      return "Uzupełnij imię oraz numer telefonu.";
    }

    if (orderMode === "delivery") {
      if (!form.addressStreet.trim() || !form.addressNumber.trim() || !form.addressCity.trim()) {
        return "Uzupełnij pełny adres dostawy (ulica, numer domu i miejscowość).";
      }
      if (!isLegionowoAddress(form.addressCity)) {
        return "Dostawy realizujemy tylko na terenie Legionowa. Wpisz Legionowo w polu Miejscowość.";
      }
    }

    if (orderMode === "pickup" && !form.pickupTime.trim()) {
      return "Podaj godzinę odbioru osobistego.";
    }

    return "";
  };

  const beginPayUCheckout = async () => {
    const error = validateOrder();
    if (error) {
      pushToast(error, "error");
      return;
    }

    const pendingOrder = createSubmittedOrder({
      cartLines,
      cartTotal,
      deliveryFee,
      finalTotal,
      form,
      orderMode,
    });

    setSubmittedOrder(pendingOrder);
    setCheckoutStatus("payu");
    pushToast("Tworzę płatność w sandboxie PayU.", "info");
    document.querySelector("#checkout-status")?.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const response = await fetch("http://127.0.0.1:8787/api/payu/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: pendingOrder,
          continueUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
        }),
      });

      const result = await response.json() as PayUResult & { error?: string };

      if (!response.ok || !result.redirectUri) {
        throw new Error(result.error ?? "PayU sandbox nie zwrócił linku płatności.");
      }

      window.localStorage.setItem("soul.pendingOrder", JSON.stringify({ ...pendingOrder, payuOrderId: result.orderId }));
      pushToast("PayU sandbox gotowy. Przekierowuję do płatności.", "success");
      window.location.assign(result.redirectUri);
    } catch (payuError) {
      pushToast(payuError instanceof Error ? payuError.message : "Nie udało się połączyć z PayU sandbox.", "error");
      pushToast("Możesz użyć przycisku symulacji sukcesu lub błędu.", "info");
    }
  };

  const completePayment = () => {
    const nextOrder = submittedOrder ?? createSubmittedOrder({
      cartLines,
      cartTotal,
      deliveryFee,
      finalTotal,
      form,
      orderMode,
    });

    setSubmittedOrder(nextOrder);
    setCart([]);
    setForm(emptyForm);
    setCheckoutStatus("success");
    pushToast("Płatność PayU zaakceptowana. Zamówienie trafiło do restauracji.", "success");
    document.querySelector("#checkout-status")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const failPayment = () => {
    setCheckoutStatus("failure");
    pushToast("PayU odrzuciło płatność. Możesz spróbować ponownie.", "error");
    document.querySelector("#checkout-status")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const retryPayment = () => {
    setCheckoutStatus("idle");
    document.querySelector("#order")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus !== "success" && paymentStatus !== "failure") {
      return;
    }

    const rawPendingOrder = window.localStorage.getItem("soul.pendingOrder");
    if (rawPendingOrder) {
      try {
        const pendingOrder = JSON.parse(rawPendingOrder) as SubmittedOrder;
        setSubmittedOrder(pendingOrder);
        if (paymentStatus === "success") {
          setCart([]);
          setForm(emptyForm);
          setCheckoutStatus("success");
          pushToast("PayU sandbox potwierdził płatność.", "success");
        } else {
          setCheckoutStatus("failure");
          pushToast("PayU sandbox zwrócił błąd płatności.", "error");
        }
        window.localStorage.removeItem("soul.pendingOrder");
      } catch {
        setCheckoutStatus(paymentStatus === "success" ? "success" : "failure");
      }
    }

    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsHeaderScrolled(window.scrollY > 80);
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    revealElements.forEach((element) => observer.observe(element));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  if (checkoutStatus === "success") {
    return <SuccessPage order={submittedOrder} />;
  }

  return (
    <>
      <a className="skip-link" href="#menu">Przejdź do menu</a>
      <Header
        cartCount={cartCount}
        isMenuOpen={isMenuOpen}
        isScrolled={isHeaderScrolled}
        onCloseMenu={() => setIsMenuOpen(false)}
        onToggleMenu={() => setIsMenuOpen((current) => !current)}
      />
      <ToastStack toasts={toasts} />

      <main id="top">
        <Hero todayHours={todayHours} />
        <Marquee />
        <AboutSection />
	<SpecialsSection />
        <MenuSection
          activeCategory={activeCategory}
          onAddToCart={addToCart}
          onCategoryChange={setActiveCategory}
          visibleMenuItems={visibleMenuItems}
        />
        <OrderSection
          cartLines={cartLines}
          cartTotal={cartTotal}
          checkoutStatus={checkoutStatus}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
          form={form}
          onAddPopular={addToCart}
          onBeginPayUCheckout={beginPayUCheckout}
          onChangeQuantity={changeQuantity}
          onCompletePayment={completePayment}
          onFailPayment={failPayment}
          onFormChange={setForm}
          onModeChange={setOrderMode}
          onRetryPayment={retryPayment}
          orderMode={orderMode}
          submittedOrder={submittedOrder}
        />
        <VisitSection today={today} />
        <FinalCta />
      </main>

      <Footer />
    </>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-label="Powiadomienia">
      {toasts.map((toast) => (
        <div className={`toast toast-${toast.kind}`} key={toast.id}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function Header({
  cartCount,
  isMenuOpen,
  isScrolled,
  onToggleMenu,
  onCloseMenu,
}: {
  cartCount: number;
  isMenuOpen: boolean;
  isScrolled: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  const navLinks = [
    { href: "#about", label: "O nas" },
    { href: "#menu", label: "Menu" },
    { href: "#order", label: "Zamów" },
    { href: "#visit", label: "Kontakt" },
  ];

  return (
    <header className={`site-header${isScrolled ? " is-scrolled" : ""}`}>
      <a className="brand" href="#top" aria-label="Soul Restaurant" onClick={onCloseMenu}>
        <img className="brand-logo" src={logoImage} alt="" />
        <span className="brand-copy">
          <strong>Soul</strong>
          <small>BBQ & Tex-Mex</small>
        </span>
      </a>

      <button className="nav-toggle" type="button" aria-label="Otwórz menu" aria-expanded={isMenuOpen} onClick={onToggleMenu}>
        <span />
        <span />
      </button>

      <nav className={`nav-links${isMenuOpen ? " is-open" : ""}`} aria-label="Nawigacja główna">
        {navLinks.map((link) => (
          <a key={link.href} href={link.href} onClick={onCloseMenu}>{link.label}</a>
        ))}
      </nav>

      <a className="header-cta" href="#order">Koszyk {cartCount > 0 ? `(${cartCount})` : ""}</a>
    </header>
  );
}

function Hero({ todayHours }: { todayHours: string }) {
  return (
    <section className="hero">
      <div className="hero-media" aria-hidden="true">
        <img src={stockImages.heroRibs} alt="" />
      </div>
      <div className="texture" />
      <div className="hero-inner">
        <p className="eyebrow">American BBQ · Tex-Mex · Legionowo</p>
        <h1 aria-label="Soul Restaurant">
          {"SOUL".split("").map((letter) => <span key={letter}>{letter}</span>)}
        </h1>
        <p className="hero-tagline">Smak, którego szukałeś, podany z dymem, ogniem i południowym charakterem.</p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#order">Zamów teraz</a>
          <a className="btn btn-ghost" href="#menu">Zobacz menu</a>
        </div>
      </div>
      <aside className="hours-badge" aria-label="Godziny otwarcia">
        <span>Dziś</span>
        <strong>{todayHours}</strong>
      </aside>
    </section>
  );
}

function Marquee() {
  const copy = "American BBQ · Tex-Mex · Burgery · Ribs · PayU · Legionowo only · Open today · ";

  return (
    <section className="marquee" aria-label="Soul highlights">
      <div className="marquee-track">
        <span>{copy}</span>
        <span>{copy}</span>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="section about reveal" id="about">
      <div className="section-kicker">O restauracji</div>
      <div className="about-grid">
        <blockquote>Tu ogień robi robotę, a sos zostaje w pamięci.</blockquote>
        <div className="about-copy">
          <p>Soul to miejsce, gdzie amerykańskie BBQ spotyka energię Tex-Mex. Burgery są grube, soczyste i konkretne, żeberka dostają dymny charakter, a nachos i skrzydełka robią robotę przy każdym większym zamówieniu.</p>
          <p>Zamówienia online przyjmujemy tylko na terenie Legionowa. Możesz wybrać dowóz albo odbiór osobisty, opłacić zamówienie przez PayU i śledzić czas do końca realizacji.</p>
        </div>
      </div>
    </section>
  );
}


function MenuSection({
  activeCategory,
  onAddToCart,
  visibleMenuItems,
  onCategoryChange,
}: {
  activeCategory: MenuCategory;
  onAddToCart: (id: string) => void;
  visibleMenuItems: MenuItem[];
  onCategoryChange: (category: MenuCategory) => void;
}) {
  return (
    <section className="section menu-section reveal" id="menu">
      <div className="section-head">
        <div>
          <p className="section-kicker">Menu showcase</p>
          <h2>Burgery, Tex-Mex i dymne klasyki</h2>
        </div>
      </div>

      <div className="filters" role="tablist" aria-label="Kategorie menu">
        {categories.map((category) => (
          <button
            className={`filter${activeCategory === category.id ? " is-active" : ""}`}
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            onClick={() => onCategoryChange(category.id)}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {visibleMenuItems.map((item) => (
          <article className={`menu-card${item.featured ? " menu-card-large" : ""}`} key={item.id}>
            <img src={item.image} alt={item.alt} />
            <div className="menu-overlay">
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <div className="menu-card-actions">
                <strong>{formatPrice(item.price)}</strong>
                <button type="button" onClick={() => onAddToCart(item.id)}>Dodaj</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OrderSection({
  cartLines,
  cartTotal,
  checkoutStatus,
  deliveryFee,
  finalTotal,
  form,
  onAddPopular,
  onBeginPayUCheckout,
  onChangeQuantity,
  onCompletePayment,
  onFailPayment,
  onFormChange,
  onModeChange,
  onRetryPayment,
  orderMode,
  submittedOrder,
}: {
  cartLines: CartLine[];
  cartTotal: number;
  checkoutStatus: CheckoutStatus;
  deliveryFee: number;
  finalTotal: number;
  form: OrderForm;
  onAddPopular: (id: string) => void;
  onBeginPayUCheckout: () => void;
  onChangeQuantity: (id: string, delta: number) => void;
  onCompletePayment: () => void;
  onFailPayment: () => void;
  onFormChange: (form: OrderForm) => void;
  onModeChange: (mode: OrderMode) => void;
  onRetryPayment: () => void;
  orderMode: OrderMode;
  submittedOrder: SubmittedOrder | null;
}) {
  const popularItems = menuItems.filter((item) => ["jack-daniels-bbq", "ribs", "nachos"].includes(item.id));

  return (
    <section className="section order-section reveal" id="order">
      <div className="section-head">
        <div>
          <p className="section-kicker">Zamów online</p>
          <h2>Dowóz w Legionowie albo odbiór osobisty</h2>
        </div>
      </div>

      <div className="order-layout">
        <div className="order-builder">
          <div className="service-area">
            <strong>Strefa dowozu</strong>
            <span>Tylko Legionowo. Adres dostawy musi zawierać nazwę miasta.</span>
          </div>

          <div className="order-mode" role="tablist" aria-label="Sposób odbioru zamówienia">
            <button className={orderMode === "delivery" ? "is-active" : ""} type="button" onClick={() => onModeChange("delivery")}>
              Dowóz
            </button>
            <button className={orderMode === "pickup" ? "is-active" : ""} type="button" onClick={() => onModeChange("pickup")}>
              Odbiór osobisty
            </button>
          </div>

          <div className="quick-add">
            <span>Najczęściej wybierane</span>
            {popularItems.map((item) => (
              <button key={item.id} type="button" onClick={() => onAddPopular(item.id)}>
                {item.title} · {formatPrice(item.price)}
              </button>
            ))}
          </div>

          <div className="order-form">
            <label>
              Imię
              <input value={form.customer} onChange={(event) => onFormChange({ ...form, customer: event.target.value })} placeholder="Np. Marek" type="text" />
            </label>
            <label>
              Telefon
              <input value={form.phone} onChange={(event) => onFormChange({ ...form, phone: event.target.value })} placeholder="+48 000 000 000" type="tel" />
            </label>
            {orderMode === "delivery" ? (
              <>
                <label>
                  Ulica
                  <input value={form.addressStreet} onChange={(event) => onFormChange({ ...form, addressStreet: event.target.value })} placeholder="Np. Piłsudskiego" type="text" />
                </label>
                <label>
                  Numer domu
                  <input value={form.addressNumber} onChange={(event) => onFormChange({ ...form, addressNumber: event.target.value })} placeholder="Np. 12" type="text" />
                </label>
                <label>
                  Numer lokalu <span style={{ fontWeight: 400, opacity: 0.6 }}>(opcjonalnie)</span>
                  <input value={form.addressApartment} onChange={(event) => onFormChange({ ...form, addressApartment: event.target.value })} placeholder="Np. 5" type="text" />
                </label>
                <label>
                  Miejscowość
                  <input
                    value={form.addressCity}
                    onChange={(event) => onFormChange({ ...form, addressCity: event.target.value })}
                    placeholder="Legionowo"
                    type="text"
                    style={form.addressCity.trim() && !isLegionowoAddress(form.addressCity) ? { borderColor: "var(--clr-accent, #e05c2a)" } : undefined}
                  />
                  {form.addressCity.trim() && !isLegionowoAddress(form.addressCity) && (
                    <span style={{ color: "var(--clr-accent, #e05c2a)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                      Dostawy realizujemy tylko na terenie Legionowa.
                    </span>
                  )}
                </label>
              </>
            ) : (
              <label>
                Godzina odbioru
                <input value={form.pickupTime} onChange={(event) => onFormChange({ ...form, pickupTime: event.target.value })} placeholder="Np. 18:30" type="text" />
              </label>
            )}
            <label>
              Uwagi do zamówienia
              <textarea value={form.notes} onChange={(event) => onFormChange({ ...form, notes: event.target.value })} placeholder="Bez cebuli, dodatkowy sos BBQ, płatność kartą..." />
            </label>
          </div>
        </div>

        <CartPanel
          cartLines={cartLines}
          cartTotal={cartTotal}
          deliveryFee={deliveryFee}
          finalTotal={finalTotal}
          onBeginPayUCheckout={onBeginPayUCheckout}
          onChangeQuantity={onChangeQuantity}
          orderMode={orderMode}
        />
      </div>

      <CheckoutStatusPanel
        checkoutStatus={checkoutStatus}
        onCompletePayment={onCompletePayment}
        onFailPayment={onFailPayment}
        onRetryPayment={onRetryPayment}
        submittedOrder={submittedOrder}
      />
    </section>
  );
}

function CartPanel({
  cartLines,
  cartTotal,
  deliveryFee,
  finalTotal,
  onBeginPayUCheckout,
  onChangeQuantity,
  orderMode,
}: {
  cartLines: CartLine[];
  cartTotal: number;
  deliveryFee: number;
  finalTotal: number;
  onBeginPayUCheckout: () => void;
  onChangeQuantity: (id: string, delta: number) => void;
  orderMode: OrderMode;
}) {
  return (
    <aside className="cart-panel" aria-label="Koszyk zamówienia">
      <div className="cart-heading">
        <span>Koszyk</span>
        <strong>{formatPrice(finalTotal)}</strong>
      </div>

      {cartLines.length === 0 ? (
        <div className="cart-empty">
          <p>Dodaj coś z menu. Dobrym startem są żeberka albo Jack Daniels BBQ.</p>
        </div>
      ) : (
        <div className="cart-lines">
          {cartLines.map(({ item, quantity }) => (
            <div className="cart-line" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <span>{formatPrice(item.price)} · {item.label}</span>
              </div>
              <div className="quantity-control">
                <button type="button" aria-label={`Usuń jedną pozycję ${item.title}`} onClick={() => onChangeQuantity(item.id, -1)}>-</button>
                <span>{quantity}</span>
                <button type="button" aria-label={`Dodaj jedną pozycję ${item.title}`} onClick={() => onChangeQuantity(item.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-summary">
        <div><span>Pozycje</span><strong>{formatPrice(cartTotal)}</strong></div>
        <div><span>{orderMode === "delivery" ? "Dowóz" : "Odbiór"}</span><strong>{formatPrice(deliveryFee)}</strong></div>
        <div className="cart-total"><span>Razem</span><strong>{formatPrice(finalTotal)}</strong></div>
      </div>

      <button className="submit-order" type="button" disabled={cartLines.length === 0} onClick={onBeginPayUCheckout}>
        Przejdź do PayU
      </button>
    </aside>
  );
}

function CheckoutStatusPanel({
  checkoutStatus,
  onCompletePayment,
  onFailPayment,
  onRetryPayment,
  submittedOrder,
}: {
  checkoutStatus: CheckoutStatus;
  onCompletePayment: () => void;
  onFailPayment: () => void;
  onRetryPayment: () => void;
  submittedOrder: SubmittedOrder | null;
}) {
  if (checkoutStatus === "idle") {
    return null;
  }

  if (checkoutStatus === "payu") {
    return (
      <div className="checkout-screen payu-screen" id="checkout-status">
        <p className="section-kicker">PayU checkout</p>
        <h3>Bezpieczna płatność PayU</h3>
        <p>W produkcji ten krok przekieruje klienta do PayU albo otworzy widget płatności. Teraz możesz zasymulować wynik transakcji.</p>
        <div className="payu-box">
          <span>payu</span>
          <strong>Sandbox PayU</strong>
          <small>Jeśli lokalny backend działa na porcie 8787, aplikacja przekieruje do prawdziwego sandboxa PayU. Przyciski poniżej zostają jako fallback UI.</small>
        </div>
        <div className="checkout-actions">
          <button className="submit-order" type="button" onClick={onCompletePayment}>Symuluj sukces PayU</button>
          <button className="btn btn-ghost" type="button" onClick={onFailPayment}>Symuluj błąd</button>
        </div>
      </div>
    );
  }

  if (checkoutStatus === "failure") {
    return (
      <div className="checkout-screen failure-screen" id="checkout-status">
        <p className="section-kicker">Płatność nieudana</p>
        <h3>Nie udało się opłacić zamówienia</h3>
        <p>PayU zwróciło błąd albo klient przerwał płatność. Koszyk zostaje zachowany, więc można spróbować ponownie.</p>
        <button className="submit-order" type="button" onClick={onRetryPayment}>Wróć do zamówienia</button>
      </div>
    );
  }

  return null;
}

function SuccessPage({ order }: { order: SubmittedOrder | null }) {
  const initialSeconds = (order?.etaMinutes ?? 35) * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  if (!order) return null;

  return (
    <div className="success-page">
      {/* Header */}
      <header className="success-page__header">
        <a href="/" aria-label="Soul Restaurant" className="brand">
          <div className="brand-copy">
            <strong>Soul</strong>
            <small>BBQ &amp; Tex-Mex</small>
          </div>
        </a>
        <a href="/" className="success-page__back">← Wróć do menu</a>
      </header>

      {/* Main content */}
      <main className="success-page__main">

        {/* Hero row: icon + heading */}
        <div className="success-page__hero">
          <div className="success-page__icon" aria-hidden="true">✓</div>
          <div className="success-page__intro">
            <p className="section-kicker">Zamówienie przyjęte</p>
            <h2 className="success-page__title">Dzięki, {order.customer}.</h2>
            <p className="success-page__subtitle">
              Kuchnia już widzi zamówienie. Dostaniesz SMS gdy będzie gotowe.
            </p>
          </div>
        </div>

        {/* Left col: Countdown */}
        <div className="checkout-screen success-page__countdown-box">
          <div className="countdown">
            <span>Szacowany czas oczekiwania</span>
            <strong>{formatCountdown(secondsLeft)}</strong>
            <small>{order.mode === "delivery" ? "Dowóz na terenie Legionowa" : "Odbiór osobisty w lokalu"}</small>
          </div>
        </div>

        {/* Right col: Order details */}
        <div className="success-page__details">
          {[
            { label: "Numer zamówienia", value: order.id },
            { label: "Łącznie do zapłaty", value: formatPrice(order.total) },
            { label: "Telefon kontaktowy", value: order.phone },
            ...(order.address ? [{ label: order.mode === "delivery" ? "Adres dostawy" : "Odbiór", value: order.address }] : []),
            { label: "Status płatności", value: "Opłacone ✓" },
          ].map(({ label, value }) => (
            <div key={label} className="success-page__detail-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        {/* Full width: ordered items */}
        {order.lines.length > 0 && (
          <div className="success-page__lines">
            <p className="eyebrow">Zamówione pozycje</p>
            <div className="success-page__lines-list">
              {order.lines.map(({ item, quantity }) => (
                <div key={item.id} className="success-page__line-row">
                  <span>{item.title} <span className="success-page__qty">× {quantity}</span></span>
                  <strong>{formatPrice(item.price * quantity)}</strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="success-page__cta">
          <a href="/" className="btn btn-primary">Zamów ponownie</a>
        </div>

      </main>

      {/* Footer */}
      <footer className="success-page__footer">
        © 2026 Soul Restaurant · Legionowo
      </footer>
    </div>
  );
}

function SpecialsSection() {
  return (
    <section className="section specials reveal" id="specials">
      <div className="section-head">
        <div>
          <p className="section-kicker">Today's special</p>
          <h2>Trzy rzeczy, od których zacząłbym wieczór</h2>
        </div>
      </div>
      <div className="specials-track">
        {specials.map((special) => (
          <article className="special" key={special.title}>
            <img src={special.image} alt={special.alt} />
            <div>
              <span>{special.label}</span>
              <h3>{special.title}</h3>
              <p>{special.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function VisitSection({ today }: { today: number }) {
  return (
    <section className="section visit reveal" id="visit">
      <div className="visit-panel">
        <div>
          <p className="section-kicker">Godziny & lokalizacja</p>
          <h2>Legionowo. Wieczór. Dym. Stół.</h2>
          <a className="big-link" href={phoneHref}>{phoneDisplay}</a>
        </div>
        <div className="hours-list" aria-label="Godziny otwarcia">
          {openingHours.map((item) => (
            <div className={item.day === today ? "is-today" : undefined} key={item.day}>
              <span>{item.label}</span>
              <strong>{item.hours}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="map-card" aria-label="Mapa lokalizacji" style={{ backgroundImage: `linear-gradient(160deg, rgba(13, 12, 10, 0.25), rgba(13, 12, 10, 0.85)), url(${stockImages.restaurant})` }}>
        <span>Legionowo</span>
        <strong>Soul Restaurant</strong>
        <p>Dostawy online tylko w granicach Legionowa. Odbiór osobisty zawsze dostępny w godzinach pracy.</p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta reveal" aria-label="Zamówienie" style={{ backgroundImage: `linear-gradient(rgba(13, 12, 10, 0.72), rgba(13, 12, 10, 0.92)), url(${stockImages.nachos})` }}>
      <p>Głodny? Dobrze. To znaczy, że strona działa.</p>
      <div>
        <a className="btn btn-primary" href="#order">Zamów online</a>
        <a className="btn btn-ghost" href={phoneHref}>Zadzwoń</a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <strong>Soul Restaurant</strong>
        <span>American BBQ · Tex-Mex · Legionowo</span>
      </div>
      <nav aria-label="Stopka">
        <a href="#about">O nas</a>
        <a href="#menu">Menu</a>
        <a href="#order">Zamów</a>
      </nav>
      <p>© 2026 Soul Restaurant. Projekt strony na podstawie design document v1.0.</p>
    </footer>
  );
}
