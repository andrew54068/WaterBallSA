--
-- PostgreSQL database dump
--

\restrict y6LPbmM0N3iHlbIXfYjvriVeuBdVxoFUQwlK3IpJowmZGKJqDNZwxMV5FLPa9ox

-- Dumped from database version 14.20
-- Dumped by pg_dump version 14.20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: FUNCTION update_updated_at_column(); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Automatically updates the updated_at timestamp when a row is modified';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapters (
    id bigint NOT NULL,
    curriculum_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    order_index integer NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    estimated_duration_hours integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chapters_duration_check CHECK (((estimated_duration_hours IS NULL) OR (estimated_duration_hours > 0))),
    CONSTRAINT chapters_order_index_check CHECK ((order_index >= 0))
);


ALTER TABLE public.chapters OWNER TO postgres;

--
-- Name: TABLE chapters; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.chapters IS 'Stores chapters within curriculums for content organization';


--
-- Name: COLUMN chapters.order_index; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chapters.order_index IS 'Display order within the curriculum (0-based)';


--
-- Name: COLUMN chapters.is_published; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.chapters.is_published IS 'Whether the chapter is visible to users';


--
-- Name: chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chapters_id_seq OWNER TO postgres;

--
-- Name: chapters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapters_id_seq OWNED BY public.chapters.id;


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id bigint NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    valid_from timestamp without time zone NOT NULL,
    valid_until timestamp without time zone NOT NULL,
    max_uses integer DEFAULT 0 NOT NULL,
    current_uses integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT coupons_current_uses_check CHECK (((current_uses >= 0) AND ((max_uses = 0) OR (current_uses <= max_uses)))),
    CONSTRAINT coupons_date_range_check CHECK ((valid_until > valid_from)),
    CONSTRAINT coupons_discount_type_check CHECK (((discount_type)::text = ANY (ARRAY[('PERCENTAGE'::character varying)::text, ('FIXED_AMOUNT'::character varying)::text]))),
    CONSTRAINT coupons_discount_value_check CHECK ((discount_value > (0)::numeric)),
    CONSTRAINT coupons_max_uses_check CHECK ((max_uses >= 0)),
    CONSTRAINT coupons_percentage_range_check CHECK ((((discount_type)::text <> 'PERCENTAGE'::text) OR ((discount_value > (0)::numeric) AND (discount_value <= (100)::numeric))))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: TABLE coupons; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.coupons IS 'Updated with seed data for Phase 3 testing (not used in Phase 2)';


--
-- Name: COLUMN coupons.code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.coupons.code IS 'Unique coupon code entered by users (e.g., WELCOME20)';


--
-- Name: COLUMN coupons.discount_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.coupons.discount_type IS 'Type of discount: PERCENTAGE (e.g., 20% off) or FIXED_AMOUNT (e.g., $10 off)';


--
-- Name: COLUMN coupons.discount_value; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.coupons.discount_value IS 'Discount value: 1-100 for PERCENTAGE, any positive amount for FIXED_AMOUNT';


--
-- Name: COLUMN coupons.max_uses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.coupons.max_uses IS 'Maximum number of times this coupon can be used (0 = unlimited)';


--
-- Name: COLUMN coupons.current_uses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.coupons.current_uses IS 'Number of times this coupon has been used';


--
-- Name: COLUMN coupons.is_active; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.coupons.is_active IS 'Whether coupon is currently active (can be deactivated manually)';


--
-- Name: CONSTRAINT coupons_current_uses_check ON coupons; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT coupons_current_uses_check ON public.coupons IS 'Allows unlimited uses when max_uses=0, otherwise enforces current_uses <= max_uses';


--
-- Name: coupons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.coupons_id_seq OWNER TO postgres;

--
-- Name: coupons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- Name: curriculums; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.curriculums (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    thumbnail_url character varying(500),
    instructor_name character varying(255) NOT NULL,
    price numeric(10,2) DEFAULT 0.00 NOT NULL,
    currency character varying(3) DEFAULT 'USD'::character varying NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    difficulty_level character varying(50),
    estimated_duration_hours integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    published_at timestamp without time zone,
    CONSTRAINT curriculums_difficulty_check CHECK (((difficulty_level)::text = ANY (ARRAY[('BEGINNER'::character varying)::text, ('INTERMEDIATE'::character varying)::text, ('ADVANCED'::character varying)::text, ('EXPERT'::character varying)::text]))),
    CONSTRAINT curriculums_duration_check CHECK (((estimated_duration_hours IS NULL) OR (estimated_duration_hours > 0))),
    CONSTRAINT curriculums_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.curriculums OWNER TO postgres;

--
-- Name: TABLE curriculums; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.curriculums IS 'Stores course/curriculum information';


--
-- Name: COLUMN curriculums.price; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.curriculums.price IS 'Price in the specified currency (0.00 for free curriculums)';


--
-- Name: COLUMN curriculums.is_published; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.curriculums.is_published IS 'Whether the curriculum is visible to users';


--
-- Name: COLUMN curriculums.estimated_duration_hours; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.curriculums.estimated_duration_hours IS 'Total estimated hours to complete all content';


--
-- Name: curriculums_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.curriculums_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.curriculums_id_seq OWNER TO postgres;

--
-- Name: curriculums_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.curriculums_id_seq OWNED BY public.curriculums.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: lessons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lessons (
    id bigint NOT NULL,
    chapter_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    lesson_type character varying(50) NOT NULL,
    content_url character varying(1000),
    order_index integer NOT NULL,
    duration_minutes integer,
    is_free_preview boolean DEFAULT false NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    content_metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT lessons_duration_check CHECK (((duration_minutes IS NULL) OR (duration_minutes > 0))),
    CONSTRAINT lessons_order_index_check CHECK ((order_index >= 0)),
    CONSTRAINT lessons_type_check CHECK (((lesson_type)::text = ANY (ARRAY[('VIDEO'::character varying)::text, ('ARTICLE'::character varying)::text, ('SURVEY'::character varying)::text])))
);


ALTER TABLE public.lessons OWNER TO postgres;

--
-- Name: TABLE lessons; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.lessons IS 'Stores individual lesson content (videos, articles, surveys)';


--
-- Name: COLUMN lessons.lesson_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lessons.lesson_type IS 'Type of lesson content: VIDEO, ARTICLE, or SURVEY';


--
-- Name: COLUMN lessons.content_url; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lessons.content_url IS 'URL or path to the lesson content';


--
-- Name: COLUMN lessons.order_index; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lessons.order_index IS 'Display order within the chapter (0-based)';


--
-- Name: COLUMN lessons.is_free_preview; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lessons.is_free_preview IS 'Whether this lesson can be accessed without purchasing the curriculum';


--
-- Name: COLUMN lessons.content_metadata; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.lessons.content_metadata IS 'JSON field for storing type-specific metadata';


--
-- Name: lessons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lessons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lessons_id_seq OWNER TO postgres;

--
-- Name: lessons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lessons_id_seq OWNED BY public.lessons.id;


--
-- Name: level_thresholds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.level_thresholds (
    level integer NOT NULL,
    cumulative_exp_required integer NOT NULL,
    exp_for_next_level integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.level_thresholds OWNER TO postgres;

--
-- Name: TABLE level_thresholds; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.level_thresholds IS 'Configuration table for gamification level progression. Contains 36 predefined levels.';


--
-- Name: COLUMN level_thresholds.level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.level_thresholds.level IS 'Level number (1-36)';


--
-- Name: COLUMN level_thresholds.cumulative_exp_required; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.level_thresholds.cumulative_exp_required IS 'Total EXP required to reach this level';


--
-- Name: COLUMN level_thresholds.exp_for_next_level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.level_thresholds.exp_for_next_level IS 'EXP needed to advance to next level (NULL for max level)';


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchases (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    curriculum_id bigint NOT NULL,
    original_price numeric(10,2) NOT NULL,
    final_price numeric(10,2) NOT NULL,
    coupon_code character varying(50),
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    purchased_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT purchases_discount_check CHECK ((final_price <= original_price)),
    CONSTRAINT purchases_final_price_check CHECK ((final_price >= (0)::numeric)),
    CONSTRAINT purchases_original_price_check CHECK ((original_price >= (0)::numeric)),
    CONSTRAINT purchases_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('COMPLETED'::character varying)::text, ('CANCELLED'::character varying)::text])))
);


ALTER TABLE public.purchases OWNER TO postgres;

--
-- Name: TABLE purchases; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.purchases IS 'Updated with seed data for development and testing';


--
-- Name: COLUMN purchases.original_price; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchases.original_price IS 'Curriculum price at time of purchase (locked, never changes)';


--
-- Name: COLUMN purchases.final_price; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchases.final_price IS 'Actual price paid after coupon discount (if any)';


--
-- Name: COLUMN purchases.coupon_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchases.coupon_code IS 'Coupon code used for discount (Phase 3 feature, nullable)';


--
-- Name: COLUMN purchases.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchases.status IS 'Purchase status: PENDING (in progress), COMPLETED (successful), CANCELLED (abandoned)';


--
-- Name: COLUMN purchases.purchased_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.purchases.purchased_at IS 'Timestamp when purchase was completed (NULL if not completed)';


--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.purchases_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.purchases_id_seq OWNER TO postgres;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: user_lesson_completions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_lesson_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    completed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    exp_awarded integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_lesson_completions OWNER TO postgres;

--
-- Name: TABLE user_lesson_completions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.user_lesson_completions IS 'Tracks lesson completions to prevent duplicate EXP awards';


--
-- Name: COLUMN user_lesson_completions.exp_awarded; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.user_lesson_completions.exp_awarded IS 'Amount of EXP awarded for this completion';


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    google_id character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    profile_picture_url character varying(500),
    total_exp integer DEFAULT 0 NOT NULL,
    current_level integer DEFAULT 1 NOT NULL,
    global_rank integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login_at timestamp without time zone,
    CONSTRAINT users_current_level_check CHECK ((current_level >= 1)),
    CONSTRAINT users_email_check CHECK (((email)::text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT users_global_rank_check CHECK (((global_rank IS NULL) OR (global_rank > 0))),
    CONSTRAINT users_total_exp_check CHECK ((total_exp >= 0))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Stores user accounts authenticated via Google OAuth';


--
-- Name: COLUMN users.google_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.google_id IS 'Unique identifier from Google OAuth';


--
-- Name: COLUMN users.total_exp; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.total_exp IS 'Total experience points earned across all activities';


--
-- Name: COLUMN users.current_level; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.current_level IS 'Current user level calculated from total_exp';


--
-- Name: COLUMN users.global_rank; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.global_rank IS 'Platform-wide ranking based on total_exp';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: video_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.video_progress (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    lesson_id bigint NOT NULL,
    current_time_seconds double precision DEFAULT 0 NOT NULL,
    duration_seconds double precision NOT NULL,
    completion_percentage integer DEFAULT 0 NOT NULL,
    is_completed boolean DEFAULT false NOT NULL,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT video_progress_completion_range CHECK (((completion_percentage >= 0) AND (completion_percentage <= 100))),
    CONSTRAINT video_progress_current_lte_duration CHECK ((current_time_seconds <= duration_seconds)),
    CONSTRAINT video_progress_current_time_positive CHECK ((current_time_seconds >= (0)::double precision)),
    CONSTRAINT video_progress_duration_positive CHECK ((duration_seconds > (0)::double precision))
);


ALTER TABLE public.video_progress OWNER TO postgres;

--
-- Name: TABLE video_progress; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.video_progress IS 'Tracks user video playback progress for resume functionality and completion tracking';


--
-- Name: COLUMN video_progress.current_time_seconds; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.video_progress.current_time_seconds IS 'Current playback position in seconds';


--
-- Name: COLUMN video_progress.duration_seconds; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.video_progress.duration_seconds IS 'Total video duration in seconds';


--
-- Name: COLUMN video_progress.completion_percentage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.video_progress.completion_percentage IS 'Completion percentage calculated as (current_time / duration) * 100';


--
-- Name: COLUMN video_progress.is_completed; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.video_progress.is_completed IS 'True when user has watched >= 95% of the video (or 100% for videos < 30 seconds)';


--
-- Name: COLUMN video_progress.completed_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.video_progress.completed_at IS 'Timestamp when the lesson was first marked as completed (preserved on rewatches)';


--
-- Name: video_progress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.video_progress_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.video_progress_id_seq OWNER TO postgres;

--
-- Name: video_progress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.video_progress_id_seq OWNED BY public.video_progress.id;


--
-- Name: chapters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters ALTER COLUMN id SET DEFAULT nextval('public.chapters_id_seq'::regclass);


--
-- Name: coupons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Name: curriculums id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curriculums ALTER COLUMN id SET DEFAULT nextval('public.curriculums_id_seq'::regclass);


--
-- Name: lessons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons ALTER COLUMN id SET DEFAULT nextval('public.lessons_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: video_progress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress ALTER COLUMN id SET DEFAULT nextval('public.video_progress_id_seq'::regclass);


--
-- Data for Name: chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapters (id, curriculum_id, title, description, order_index, is_published, estimated_duration_hours, created_at, updated_at) FROM stdin;
1	1	設計模式基礎	認識設計模式的基本概念與重要性	0	t	5	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
2	1	創建型模式	學習 Singleton、Factory、Builder 等創建型模式	1	t	10	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
3	1	結構型模式	掌握 Adapter、Decorator、Proxy 等結構型模式	2	t	8	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
4	1	行為型模式	深入 Observer、Strategy、Command 等行為型模式	3	t	10	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
5	1	實戰專案	將設計模式應用於實際專案開發	4	t	7	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
8	2	AI 輔助開發工具	掌握 AI 工具來加速開發流程	2	t	10	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
9	2	自動化測試整合	整合 BDD 與自動化測試框架	3	t	7	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
10	2	全自動開發實戰	建立完整的 AI + BDD 開發流程	4	t	5	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
11	3	Java 入門	Java 程式語言介紹、環境設定與第一個程式	0	t	5	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
12	3	物件導向程式設計	學習類別、物件、繼承、多型與封裝	1	t	10	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
13	3	Java 資料結構	ArrayList、HashMap、LinkedList 等重要資料結構	2	t	8	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
14	3	例外處理與檔案 I/O	錯誤處理、try-catch 區塊與檔案操作	3	t	7	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
15	3	實戰專案開發	應用所學知識建立實務 Java 應用程式	4	t	10	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.923216
6	2	課程介紹 & 試聽	課程總覽與免費試聽內容	0	t	5	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.947487
7	2	副本零：冒險者指引	開始你的 BDD 之旅	1	t	8	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.947487
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, discount_type, discount_value, valid_from, valid_until, max_uses, current_uses, is_active, created_at, updated_at) FROM stdin;
1	WELCOME20	PERCENTAGE	20.00	2025-01-01 00:00:00	2025-12-31 23:59:59	0	1	t	2025-12-01 14:36:28.044918	2025-12-01 14:36:28.044918
2	NEWYEAR2025	FIXED_AMOUNT	10.00	2025-01-01 00:00:00	2025-01-31 23:59:59	100	0	t	2025-12-01 14:36:28.044918	2025-12-01 14:36:28.044918
3	BLACKFRIDAY	PERCENTAGE	50.00	2025-11-25 00:00:00	2025-11-30 23:59:59	500	0	t	2025-12-01 14:36:28.044918	2025-12-01 14:36:28.044918
4	EXPIRED10	PERCENTAGE	10.00	2025-01-01 00:00:00	2025-06-30 23:59:59	0	15	f	2025-12-01 14:36:28.044918	2025-12-01 14:36:28.044918
5	STUDENT15	PERCENTAGE	15.00	2025-01-01 00:00:00	2025-12-31 23:59:59	0	42	t	2025-12-01 14:36:28.044918	2025-12-01 14:36:28.044918
6	EARLYBIRD	FIXED_AMOUNT	25.00	2025-01-01 00:00:00	2025-12-31 23:59:59	50	49	t	2025-12-01 14:36:28.044918	2025-12-01 14:36:28.044918
\.


--
-- Data for Name: curriculums; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.curriculums (id, title, description, thumbnail_url, instructor_name, price, currency, is_published, difficulty_level, estimated_duration_hours, created_at, updated_at, published_at) FROM stdin;
1	軟體設計模式精通之旅	用一趟旅程的時間，成為硬核的 Coding 實戰高手。精進一套能延續的學習系統與思路。	https://placehold.co/600x400/4F46E5/ffffff?text=Design+Patterns&font=noto-sans	水球潘	3000.00	TWD	t	BEGINNER	40	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.936972	2025-12-01 14:36:27.923216
2	AI x BDD：規格驅動全自動開發術	AI Top 1% 工程師必修課，掌握規格驅動的全自動化開發	https://placehold.co/600x400/06B6D4/ffffff?text=AI+BDD&font=noto-sans	水球潘	4500.00	TWD	t	INTERMEDIATE	35	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.936972	2025-12-01 14:36:27.923216
3	Java 從零開始	從基礎到進階，完整掌握 Java 程式設計。學習物件導向程式設計、資料結構、演算法，並建立實務專案。適合初學者與中階程式設計師。	https://placehold.co/600x400/F59E0B/ffffff?text=Java&font=noto-sans	水球潘	2999.00	TWD	t	BEGINNER	40	2025-12-01 14:36:27.923216	2025-12-01 14:36:27.936972	2025-12-01 14:36:27.923216
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	create users table	SQL	V1__create_users_table.sql	1852512267	postgres	2025-12-01 14:36:27.722713	28	t
2	2	create curriculums table	SQL	V2__create_curriculums_table.sql	-272063651	postgres	2025-12-01 14:36:27.770717	29	t
3	3	create chapters table	SQL	V3__create_chapters_table.sql	1636493693	postgres	2025-12-01 14:36:27.818441	24	t
4	4	create lessons table	SQL	V4__create_lessons_table.sql	-1904532211	postgres	2025-12-01 14:36:27.850739	27	t
5	5	create update timestamp triggers	SQL	V5__create_update_timestamp_triggers.sql	-491686391	postgres	2025-12-01 14:36:27.8873	3	t
6	6	insert seed data	SQL	V6__insert_seed_data.sql	1881961185	postgres	2025-12-01 14:36:27.900011	9	t
7	7	update curriculum seed data	SQL	V7__update_curriculum_seed_data.sql	1058640002	postgres	2025-12-01 14:36:27.9198	5	t
8	8	update curriculum thumbnails	SQL	V8__update_curriculum_thumbnails.sql	-28427480	postgres	2025-12-01 14:36:27.935471	2	t
9	9	setup ai bdd course lessons	SQL	V9__setup_ai_bdd_course_lessons.sql	1735333335	postgres	2025-12-01 14:36:27.944968	3	t
10	10	create purchases table	SQL	V10__create_purchases_table.sql	575651185	postgres	2025-12-01 14:36:27.956099	29	t
11	11	create coupons table	SQL	V11__create_coupons_table.sql	-2056140801	postgres	2025-12-01 14:36:27.991641	21	t
12	12	insert purchase seed data	SQL	V12__insert_purchase_seed_data.sql	1269365105	postgres	2025-12-01 14:36:28.018896	8	t
13	13	fix coupons current uses constraint	SQL	V13__fix_coupons_current_uses_constraint.sql	1836583936	postgres	2025-12-01 14:36:28.035927	1	t
14	14	insert coupon seed data	SQL	V14__insert_coupon_seed_data.sql	-875797610	postgres	2025-12-01 14:36:28.043079	2	t
15	15	create video progress table	SQL	V15__create_video_progress_table.sql	2127290531	postgres	2025-12-01 14:36:28.051201	17	t
16	16	create level thresholds table	SQL	V16__create_level_thresholds_table.sql	891307040	postgres	2025-12-01 17:33:10.63293	17	t
17	17	create user lesson completions table	SQL	V17__create_user_lesson_completions_table.sql	-2054780992	postgres	2025-12-01 17:41:15.036978	31	t
\.


--
-- Data for Name: lessons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lessons (id, chapter_id, title, description, lesson_type, content_url, order_index, duration_minutes, is_free_preview, is_published, content_metadata, created_at, updated_at) FROM stdin;
11	6	AI x BDD：規格驅動全自動開發術 | 一次到位的 AI Coding	Vibe Coding 最大的問題就是沒有規格，導致開發過程充滿不確定性。本課程教你如何使用 AI 結合 BDD 規格驅動開發，打造高品質的軟體。	VIDEO	https://www.youtube.com/watch?v=W09vydJH6jo	0	25	t	t	{"resolution": "1080p", "hasSubtitles": true}	2025-12-01 14:36:27.947487	2025-12-01 14:36:27.947487
12	7	戰略戰術設計模式到底追求的是什麼？	上一集中，水球開啟了全新的大章節「戰略戰術設計模式」，在這個章節中我們將會學習如何使用設計模式來提升程式碼的可維護性與擴展性。	VIDEO	https://www.youtube.com/watch?v=mOJzH0U_3EU	0	30	f	t	{"resolution": "1080p", "hasSubtitles": true}	2025-12-01 14:36:27.947487	2025-12-01 14:36:27.947487
13	7	水球軟體學院 2023 跨年頒獎典禮	今年一樣抽免費軟設培訓！回顧 2023 年水球軟體學院的精彩時刻，並展望新的一年。	VIDEO	https://www.youtube.com/watch?v=MtdiKYAwjJw	1	45	f	t	{"resolution": "1080p", "hasSubtitles": true}	2025-12-01 14:36:27.947487	2025-12-01 14:36:27.947487
3	2	SOLID 原則	學習物件導向設計的五大原則	VIDEO	https://www.youtube.com/watch?v=dQw4w9WgXcQ	2	30	f	t	{"duration": 1800, "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}	2025-12-01 14:36:27.923216	2025-12-01 17:38:15.134707
4	2	設計模式分類	認識創建型、結構型、行為型模式	VIDEO	https://youtu.be/wtubL3MIOq8?si=FexZNblVpAGFfBvK	3	25	f	t	{"duration": 900, "videoUrl": "https://youtu.be/wtubL3MIOq8?si=FexZNblVpAGFfBvK"}	2025-12-01 14:36:27.923216	2025-12-01 17:38:30.093409
1	1	什麼是設計模式？	了解設計模式的定義與歷史背景	VIDEO	https://youtu.be/vzxhA1CheSQ?si=wBXHjit5Wsx32olN	0	15	t	t	{"duration": 900, "videoUrl": "https://youtu.be/vzxhA1CheSQ?si=wBXHjit5Wsx32olN"}	2025-12-01 14:36:27.923216	2025-12-01 17:48:33.039338
2	1	為什麼需要設計模式	探討設計模式解決的問題與價值	VIDEO	https://youtu.be/uldpKi42w2c?si=EQCMFfDc3rOR3H7i	1	20	t	t	{"duration": 1200, "videoUrl": "https://youtu.be/uldpKi42w2c?si=EQCMFfDc3rOR3H7i"}	2025-12-01 14:36:27.923216	2025-12-01 17:49:25.113718
\.


--
-- Data for Name: level_thresholds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.level_thresholds (level, cumulative_exp_required, exp_for_next_level, created_at) FROM stdin;
1	0	200	2025-12-01 17:33:10.641544+00
2	200	300	2025-12-01 17:33:10.641544+00
3	500	1000	2025-12-01 17:33:10.641544+00
4	1500	1500	2025-12-01 17:33:10.641544+00
5	3000	2000	2025-12-01 17:33:10.641544+00
6	5000	2000	2025-12-01 17:33:10.641544+00
7	7000	2000	2025-12-01 17:33:10.641544+00
8	9000	2000	2025-12-01 17:33:10.641544+00
9	11000	2000	2025-12-01 17:33:10.641544+00
10	13000	2000	2025-12-01 17:33:10.641544+00
11	15000	2000	2025-12-01 17:33:10.641544+00
12	17000	2000	2025-12-01 17:33:10.641544+00
13	19000	2000	2025-12-01 17:33:10.641544+00
14	21000	2000	2025-12-01 17:33:10.641544+00
15	23000	2000	2025-12-01 17:33:10.641544+00
16	25000	2000	2025-12-01 17:33:10.641544+00
17	27000	2000	2025-12-01 17:33:10.641544+00
18	29000	2000	2025-12-01 17:33:10.641544+00
19	31000	2000	2025-12-01 17:33:10.641544+00
20	33000	2000	2025-12-01 17:33:10.641544+00
21	35000	2000	2025-12-01 17:33:10.641544+00
22	37000	2000	2025-12-01 17:33:10.641544+00
23	39000	2000	2025-12-01 17:33:10.641544+00
24	41000	2000	2025-12-01 17:33:10.641544+00
25	43000	2000	2025-12-01 17:33:10.641544+00
26	45000	2000	2025-12-01 17:33:10.641544+00
27	47000	2000	2025-12-01 17:33:10.641544+00
28	49000	2000	2025-12-01 17:33:10.641544+00
29	51000	2000	2025-12-01 17:33:10.641544+00
30	53000	2000	2025-12-01 17:33:10.641544+00
31	55000	2000	2025-12-01 17:33:10.641544+00
32	57000	2000	2025-12-01 17:33:10.641544+00
33	59000	2000	2025-12-01 17:33:10.641544+00
34	61000	2000	2025-12-01 17:33:10.641544+00
35	63000	2000	2025-12-01 17:33:10.641544+00
36	65000	\N	2025-12-01 17:33:10.641544+00
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchases (id, user_id, curriculum_id, original_price, final_price, coupon_code, status, purchased_at, created_at, updated_at) FROM stdin;
2	1	3	2999.00	2399.20	WELCOME20	COMPLETED	2025-11-10 14:15:00	2025-11-10 14:10:00	2025-11-10 14:15:00
4	3	1	3000.00	3000.00	\N	COMPLETED	2025-11-15 16:45:00	2025-11-15 16:40:00	2025-11-15 16:45:00
5	1	2	4500.00	4500.00	\N	PENDING	\N	2025-11-27 20:00:00	2025-11-27 20:00:00
7	4	1	3000.00	3000.00	\N	COMPLETED	2025-12-01 18:08:55.951211	2025-12-01 18:08:51.092997	2025-12-01 18:08:55.946546
\.


--
-- Data for Name: user_lesson_completions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_lesson_completions (id, user_id, lesson_id, completed_at, exp_awarded, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, google_id, email, name, profile_picture_url, total_exp, current_level, global_rank, created_at, updated_at, last_login_at) FROM stdin;
1	google123	john.doe@example.com	John Doe	https://ui-avatars.com/api/?name=John+Doe	500	3	\N	2025-12-01 14:36:27.904719	2025-12-01 14:36:27.904719	\N
2	google456	jane.smith@example.com	Jane Smith	https://ui-avatars.com/api/?name=Jane+Smith	1200	4	\N	2025-12-01 14:36:27.904719	2025-12-01 14:36:27.904719	\N
3	google789	bob.wilson@example.com	Bob Wilson	https://ui-avatars.com/api/?name=Bob+Wilson	250	2	\N	2025-12-01 14:36:27.904719	2025-12-01 14:36:27.904719	\N
4	116211001123021585988	andrew0424718012@gmail.com	Dawson Wang	https://lh3.googleusercontent.com/a/ACg8ocI0G6YkhhC1nS_aAYwWU9oQQUhBVdaHo7qBhaKKtFSN0nKq6WzKkQ=s96-c	0	1	\N	2025-12-01 17:45:39.736907	2025-12-01 17:45:39.716364	2025-12-01 17:45:39.816418
\.


--
-- Data for Name: video_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.video_progress (id, user_id, lesson_id, current_time_seconds, duration_seconds, completion_percentage, is_completed, completed_at, created_at, updated_at) FROM stdin;
3	4	2	0	214	0	f	\N	2025-12-01 17:49:35.05138	2025-12-01 17:49:35.05138
9	4	3	0	214	0	f	\N	2025-12-01 18:24:14.190248	2025-12-01 18:24:14.190248
10	4	4	0	2924	0	f	\N	2025-12-01 18:24:16.652937	2025-12-01 18:24:16.652937
1	4	1	20.715941	2522	1	f	\N	2025-12-01 17:45:59.233714	2025-12-01 18:43:39.079747
\.


--
-- Name: chapters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chapters_id_seq', 15, true);


--
-- Name: coupons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupons_id_seq', 6, true);


--
-- Name: curriculums_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.curriculums_id_seq', 6, true);


--
-- Name: lessons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lessons_id_seq', 13, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.purchases_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: video_progress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.video_progress_id_seq', 20, true);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_unique_order_per_curriculum; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_unique_order_per_curriculum UNIQUE (curriculum_id, order_index);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: curriculums curriculums_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.curriculums
    ADD CONSTRAINT curriculums_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_unique_order_per_chapter; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_unique_order_per_chapter UNIQUE (chapter_id, order_index);


--
-- Name: level_thresholds level_thresholds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.level_thresholds
    ADD CONSTRAINT level_thresholds_pkey PRIMARY KEY (level);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_user_curriculum_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_user_curriculum_unique UNIQUE (user_id, curriculum_id);


--
-- Name: CONSTRAINT purchases_user_curriculum_unique ON purchases; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON CONSTRAINT purchases_user_curriculum_unique ON public.purchases IS 'Ensures user can only purchase same curriculum once';


--
-- Name: user_lesson_completions user_lesson_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_lesson_completions
    ADD CONSTRAINT user_lesson_completions_pkey PRIMARY KEY (id);


--
-- Name: user_lesson_completions user_lesson_completions_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_lesson_completions
    ADD CONSTRAINT user_lesson_completions_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: video_progress video_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_pkey PRIMARY KEY (id);


--
-- Name: video_progress video_progress_unique_user_lesson; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT video_progress_unique_user_lesson UNIQUE (user_id, lesson_id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_chapters_curriculum_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chapters_curriculum_id ON public.chapters USING btree (curriculum_id);


--
-- Name: idx_chapters_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chapters_is_published ON public.chapters USING btree (is_published);


--
-- Name: idx_chapters_order_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chapters_order_index ON public.chapters USING btree (curriculum_id, order_index);


--
-- Name: idx_coupons_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);


--
-- Name: idx_coupons_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_is_active ON public.coupons USING btree (is_active);


--
-- Name: idx_coupons_valid_from; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_valid_from ON public.coupons USING btree (valid_from);


--
-- Name: idx_coupons_valid_until; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_valid_until ON public.coupons USING btree (valid_until);


--
-- Name: idx_coupons_validity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_validity ON public.coupons USING btree (code, is_active, valid_from, valid_until);


--
-- Name: idx_curriculums_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_curriculums_created_at ON public.curriculums USING btree (created_at);


--
-- Name: idx_curriculums_difficulty_level; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_curriculums_difficulty_level ON public.curriculums USING btree (difficulty_level);


--
-- Name: idx_curriculums_instructor_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_curriculums_instructor_name ON public.curriculums USING btree (instructor_name);


--
-- Name: idx_curriculums_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_curriculums_is_published ON public.curriculums USING btree (is_published);


--
-- Name: idx_lessons_chapter_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_chapter_id ON public.lessons USING btree (chapter_id);


--
-- Name: idx_lessons_content_metadata; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_content_metadata ON public.lessons USING gin (content_metadata);


--
-- Name: idx_lessons_is_free_preview; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_is_free_preview ON public.lessons USING btree (is_free_preview);


--
-- Name: idx_lessons_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_is_published ON public.lessons USING btree (is_published);


--
-- Name: idx_lessons_lesson_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_lesson_type ON public.lessons USING btree (lesson_type);


--
-- Name: idx_lessons_order_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_lessons_order_index ON public.lessons USING btree (chapter_id, order_index);


--
-- Name: idx_level_thresholds_cumulative_exp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_level_thresholds_cumulative_exp ON public.level_thresholds USING btree (cumulative_exp_required DESC);


--
-- Name: idx_purchases_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_created_at ON public.purchases USING btree (created_at DESC);


--
-- Name: idx_purchases_curriculum_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_curriculum_id ON public.purchases USING btree (curriculum_id);


--
-- Name: idx_purchases_purchased_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_purchased_at ON public.purchases USING btree (purchased_at);


--
-- Name: idx_purchases_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_status ON public.purchases USING btree (status);


--
-- Name: idx_purchases_user_curriculum_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_user_curriculum_status ON public.purchases USING btree (user_id, curriculum_id, status);


--
-- Name: idx_purchases_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_purchases_user_id ON public.purchases USING btree (user_id);


--
-- Name: idx_user_lesson_completions_completed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_lesson_completions_completed_at ON public.user_lesson_completions USING btree (completed_at DESC);


--
-- Name: idx_user_lesson_completions_lesson; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_lesson_completions_lesson ON public.user_lesson_completions USING btree (lesson_id);


--
-- Name: idx_user_lesson_completions_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_lesson_completions_user ON public.user_lesson_completions USING btree (user_id);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_global_rank; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_global_rank ON public.users USING btree (global_rank) WHERE (global_rank IS NOT NULL);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);


--
-- Name: idx_video_progress_completed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_video_progress_completed ON public.video_progress USING btree (user_id, is_completed) WHERE (is_completed = true);


--
-- Name: idx_video_progress_lesson_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_video_progress_lesson_id ON public.video_progress USING btree (lesson_id);


--
-- Name: idx_video_progress_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_video_progress_user_id ON public.video_progress USING btree (user_id);


--
-- Name: chapters update_chapters_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: coupons update_coupons_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: curriculums update_curriculums_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_curriculums_updated_at BEFORE UPDATE ON public.curriculums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lessons update_lessons_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: purchases update_purchases_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: video_progress update_video_progress_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_video_progress_updated_at BEFORE UPDATE ON public.video_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chapters fk_chapters_curriculum; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT fk_chapters_curriculum FOREIGN KEY (curriculum_id) REFERENCES public.curriculums(id) ON DELETE CASCADE;


--
-- Name: lessons fk_lessons_chapter; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT fk_lessons_chapter FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: purchases fk_purchases_curriculum; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT fk_purchases_curriculum FOREIGN KEY (curriculum_id) REFERENCES public.curriculums(id) ON DELETE RESTRICT;


--
-- Name: purchases fk_purchases_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT fk_purchases_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: video_progress fk_video_progress_lesson; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT fk_video_progress_lesson FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: video_progress fk_video_progress_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.video_progress
    ADD CONSTRAINT fk_video_progress_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_lesson_completions user_lesson_completions_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_lesson_completions
    ADD CONSTRAINT user_lesson_completions_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: user_lesson_completions user_lesson_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_lesson_completions
    ADD CONSTRAINT user_lesson_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict y6LPbmM0N3iHlbIXfYjvriVeuBdVxoFUQwlK3IpJowmZGKJqDNZwxMV5FLPa9ox

