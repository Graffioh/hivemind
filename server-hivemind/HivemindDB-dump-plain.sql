--
-- PostgreSQL database dump
--

-- Dumped from database version 14.11 (Homebrew)
-- Dumped by pg_dump version 16.1

-- Started on 2024-07-03 12:07:38 CEST

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
-- TOC entry 4 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: ubreglia
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ubreglia;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 209 (class 1259 OID 16550)
-- Name: comments; Type: TABLE; Schema: public; Owner: ubreglia
--

CREATE TABLE public.comments (
    id integer NOT NULL,
    post_id integer NOT NULL,
    user_id bigint NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    up_vote integer DEFAULT 0,
    down_vote integer DEFAULT 0
);


ALTER TABLE public.comments OWNER TO ubreglia;

--
-- TOC entry 210 (class 1259 OID 16558)
-- Name: comments_id_seq; Type: SEQUENCE; Schema: public; Owner: ubreglia
--

CREATE SEQUENCE public.comments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comments_id_seq OWNER TO ubreglia;

--
-- TOC entry 3655 (class 0 OID 0)
-- Dependencies: 210
-- Name: comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ubreglia
--

ALTER SEQUENCE public.comments_id_seq OWNED BY public.comments.id;


--
-- TOC entry 211 (class 1259 OID 16559)
-- Name: posts; Type: TABLE; Schema: public; Owner: ubreglia
--

CREATE TABLE public.posts (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    up_vote integer DEFAULT 0,
    down_vote integer DEFAULT 0
);


ALTER TABLE public.posts OWNER TO ubreglia;

--
-- TOC entry 212 (class 1259 OID 16567)
-- Name: posts_id_seq; Type: SEQUENCE; Schema: public; Owner: ubreglia
--

CREATE SEQUENCE public.posts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.posts_id_seq OWNER TO ubreglia;

--
-- TOC entry 3656 (class 0 OID 0)
-- Dependencies: 212
-- Name: posts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ubreglia
--

ALTER SEQUENCE public.posts_id_seq OWNED BY public.posts.id;


--
-- TOC entry 213 (class 1259 OID 16568)
-- Name: reactions; Type: TABLE; Schema: public; Owner: ubreglia
--

CREATE TABLE public.reactions (
    id integer NOT NULL,
    user_id bigint NOT NULL,
    post_id integer,
    comment_id integer,
    reaction_type character varying(10) NOT NULL,
    reaction smallint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reactions_reaction_type_check CHECK (((reaction_type)::text = ANY (ARRAY[('post'::character varying)::text, ('comment'::character varying)::text])))
);


ALTER TABLE public.reactions OWNER TO ubreglia;

--
-- TOC entry 214 (class 1259 OID 16573)
-- Name: reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: ubreglia
--

CREATE SEQUENCE public.reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reactions_id_seq OWNER TO ubreglia;

--
-- TOC entry 3657 (class 0 OID 0)
-- Dependencies: 214
-- Name: reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ubreglia
--

ALTER SEQUENCE public.reactions_id_seq OWNED BY public.reactions.id;


--
-- TOC entry 215 (class 1259 OID 16574)
-- Name: sessions; Type: TABLE; Schema: public; Owner: ubreglia
--

CREATE TABLE public.sessions (
    token text NOT NULL,
    expires_at integer NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO ubreglia;

--
-- TOC entry 216 (class 1259 OID 16579)
-- Name: users; Type: TABLE; Schema: public; Owner: ubreglia
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL
);


ALTER TABLE public.users OWNER TO ubreglia;

--
-- TOC entry 3470 (class 2604 OID 16627)
-- Name: comments id; Type: DEFAULT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.comments ALTER COLUMN id SET DEFAULT nextval('public.comments_id_seq'::regclass);


--
-- TOC entry 3474 (class 2604 OID 16628)
-- Name: posts id; Type: DEFAULT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.posts ALTER COLUMN id SET DEFAULT nextval('public.posts_id_seq'::regclass);


--
-- TOC entry 3478 (class 2604 OID 16629)
-- Name: reactions id; Type: DEFAULT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.reactions ALTER COLUMN id SET DEFAULT nextval('public.reactions_id_seq'::regclass);


--
-- TOC entry 3641 (class 0 OID 16550)
-- Dependencies: 209
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: ubreglia
--

INSERT INTO public.comments VALUES (42, 62, 1718530860, ':/', '2024-06-27 18:50:35.017', 0, 0);
INSERT INTO public.comments VALUES (43, 66, 1718530860, 'lfggggggggggggg', '2024-06-27 18:51:08.448', 0, 0);
INSERT INTO public.comments VALUES (44, 72, 1718530860, 'nice post!', '2024-07-01 12:19:58.551', 0, 0);
INSERT INTO public.comments VALUES (45, 78, 1717958178, 'Ciao marco', '2024-07-03 08:59:03.57', 1, 0);
INSERT INTO public.comments VALUES (46, 60, 1717958178, 'nice!', '2024-07-03 09:57:29.34', 1, 0);


--
-- TOC entry 3643 (class 0 OID 16559)
-- Dependencies: 211
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: ubreglia
--

INSERT INTO public.posts VALUES (75, 1719337324, 'A guide to starting a mindfulness practice and its benefits for mental health.', '2024-07-01 11:51:41.843796+02', 'Mindfulness Meditation for Beginners', 4, 5);
INSERT INTO public.posts VALUES (62, 1719512917, 'should i use a proprietary bloated software or a fully customizable editor????

please help me!', '2024-06-27 20:27:46.501+02', 'vscode or nvim?', 3, 2);
INSERT INTO public.posts VALUES (67, 1719337324, 'Exploring the ancient Japanese practice of cultivating miniature trees.', '2024-07-01 11:51:41.843796+02', 'The Art of Bonsai', 4, 4);
INSERT INTO public.posts VALUES (77, 1717958178, '# Testing markdown

## super test

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum', '2024-07-02 10:38:20.339+02', 'markdown test', 2, 0);
INSERT INTO public.posts VALUES (70, 1719512917, 'Examining the growing trend of eco-friendly and ethical clothing production.', '2024-07-01 11:51:41.843796+02', 'The Rise of Sustainable Fashion', 3, 6);
INSERT INTO public.posts VALUES (76, 1718964866, 'Analyzing the positive and negative effects of social media platforms on modern culture.', '2024-07-01 11:51:41.843796+02', 'The Impact of Social Media on Society', 8, 5);
INSERT INTO public.posts VALUES (73, 1718530860, 'Tips and techniques for cultivating vegetables and herbs in apartments and small yards.', '2024-07-01 11:51:41.843796+02', 'Urban Gardening: Growing Food in Small Spaces', 3, 4);
INSERT INTO public.posts VALUES (71, 1719337324, 'An in-depth look at how blockchain works and its potential applications beyond cryptocurrency.', '2024-07-01 11:51:41.843796+02', 'Understanding Blockchain Technology', 6, 3);
INSERT INTO public.posts VALUES (74, 1719512917, 'Tracing the history of AI from its inception to current advancements and future possibilities.', '2024-07-01 11:51:41.843796+02', 'The Evolution of Artificial Intelligence', 6, 2);
INSERT INTO public.posts VALUES (60, 1718530860, 'This is the first post!', '2024-06-27 20:25:37.055589+02', 'First post', 11, 3);
INSERT INTO public.posts VALUES (66, 1718530860, '# LFGGGG

~~~
print("LET''S FUCKING GO")
~~~

**yes**

*x*', '2024-06-27 20:51:00.714+02', 'helooo and lfg', 2, 9);
INSERT INTO public.posts VALUES (68, 1718964866, 'Discussing the potential applications and challenges of quantum computers.', '2024-07-01 11:51:41.843796+02', 'Future of Quantum Computing', 6, 1);
INSERT INTO public.posts VALUES (69, 1718530860, 'A journey through the diverse and flavorful cuisines of Southeast Asian countries.', '2024-07-01 11:51:41.843796+02', 'Culinary Adventures in Southeast Asia', 2, 5);
INSERT INTO public.posts VALUES (78, 1719997018, '# Nome
Marco

# Cognome
Marco

Si sono proprio marco

Lorem ipsum dolor sit amet, consectetur adipiscing elit. In pharetra malesuada lorem, et ultricies nunc pretium in. Pellentesque vulputate iaculis consequat. Mauris posuere augue nec elit laoreet, sed molestie neque porttitor. Phasellus mollis odio lacinia, interdum erat eget, molestie dui. Quisque convallis hendrerit iaculis. Maecenas mattis aliquet justo vitae iaculis. Mauris gravida lacus quis urna luctus lacinia. Cras vitae quam odio. Proin nec nibh eu velit congue lobortis vitae at mi. Pellentesque vitae nunc vitae enim scelerisque pellentesque ac at ex. Curabitur finibus quam vel nulla gravida, vitae ornare ligula vehicula. Maecenas interdum, massa id ultrices feugiat, libero urna lobortis ligula, et ultrices elit orci nec diam.

Cras ullamcorper ante nulla, at vulputate nunc congue eu. Pellentesque sodales, diam quis commodo elementum, purus lectus tempor magna, non tempor odio massa quis diam. Praesent ornare pulvinar ligula ut ultrices. Maecenas rhoncus eget mauris ut blandit. Phasellus ac felis eget massa rhoncus euismod. Maecenas pretium elit elementum felis rutrum maximus. Sed nec gravida erat. Sed eros dolor, tincidunt nec rhoncus in, aliquam eget lectus. Phasellus semper nunc quis ex euismod convallis. Aliquam rhoncus ex sed nulla varius bibendum id non odio.

Maecenas vehicula velit vel massa ornare rutrum. Vivamus a mi vel velit finibus fringilla. Morbi luctus eget magna non aliquam. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse lacinia eros eget felis dictum, non tincidunt lorem malesuada. Maecenas ut auctor felis. Cras euismod ultricies sapien id faucibus. Integer placerat pharetra nulla, quis porttitor ex accumsan non. Sed in elit imperdiet, euismod eros non, pellentesque tellus. Nulla facilisi. Donec feugiat dapibus ultricies. Phasellus maximus, nulla ut euismod auctor, est turpis lobortis urna, vitae aliquam urna leo vitae nunc. Morbi iaculis tortor sed sagittis pellentesque.

Ut ut scelerisque ante. Maecenas sed varius leo, at iaculis leo. Quisque ac commodo eros. Fusce pulvinar ac purus ut elementum. Etiam vestibulum ipsum non justo dictum, vel semper ligula egestas. Aenean ac dignissim neque. Nullam suscipit, urna id luctus hendrerit, lectus erat sollicitudin sem, vitae placerat risus turpis eget sapien. Donec id lorem sed ligula dictum feugiat. Donec vel leo mi. Suspendisse luctus laoreet lorem, ac blandit enim sagittis in. Aliquam eu velit eu metus auctor imperdiet. Nunc scelerisque neque efficitur nulla facilisis, sit amet suscipit diam sollicitudin. Proin non lectus consectetur, facilisis libero id, tincidunt sem. Donec ullamcorper, mi ac faucibus finibus, odio massa efficitur sem, eu congue dui justo sed nisi. Donec dolor dolor, placerat sed diam non, elementum porta nulla. Vivamus accumsan rhoncus magna sed ornare.

Quisque sit amet ipsum sodales, pellentesque felis quis, consectetur turpis. Sed hendrerit tempus libero, eu viverra diam semper vitae. Maecenas tempor accumsan metus sit amet auctor. Aenean lobortis lectus eu diam placerat, sit amet egestas lectus efficitur. Nulla sed augue elit. Sed tristique tristique purus non volutpat. Vestibulum euismod diam sed nunc commodo, ut maximus lacus consequat.

In quis magna sodales, fringilla neque eu, gravida ipsum. Quisque faucibus elit et tristique sagittis. Maecenas tristique nunc a erat vehicula pharetra. Sed ex justo, tempor eu urna nec, consequat venenatis nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut auctor justo nec nulla varius fringilla. Vestibulum sagittis magna ultricies dolor consectetur venenatis. Maecenas ut turpis at est fermentum sodales eget sed quam. Vestibulum vehicula felis ornare erat viverra, sed mollis ante pharetra.', '2024-07-03 10:58:10.399+02', 'Ciao sono marco', 1, 0);
INSERT INTO public.posts VALUES (72, 1718964866, 'Exploring how different colors influence consumer behavior and brand perception.', '2024-07-01 11:51:41.843796+02', 'The Psychology of Color in Marketing', 9, 1);
INSERT INTO public.posts VALUES (95, 1720000684, 'Bhuuuuuuuuuuuuuuuuuuuuuuuuuu', '2024-07-03 11:58:39.093+02', 'Il Napoli non vince più', 1, 0);


--
-- TOC entry 3645 (class 0 OID 16568)
-- Dependencies: 213
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: ubreglia
--

INSERT INTO public.reactions VALUES (243, 6, 70, NULL, 'post', 1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (244, 6, 76, NULL, 'post', -1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (245, 7, 68, NULL, 'post', -1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (246, 7, 74, NULL, 'post', 1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (247, 7, 66, NULL, 'post', -1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (248, 8, 71, NULL, 'post', 1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (249, 8, 67, NULL, 'post', -1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (250, 8, 75, NULL, 'post', 1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (251, 9, 60, NULL, 'post', -1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (252, 9, 73, NULL, 'post', 1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (253, 9, 69, NULL, 'post', -1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (229, 6, 71, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (254, 10, 72, NULL, 'post', 1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (255, 10, 76, NULL, 'post', 1, '2024-07-01 12:18:40.495354');
INSERT INTO public.reactions VALUES (256, 1718530860, NULL, 44, 'comment', 1, '2024-07-01 12:20:00.894');
INSERT INTO public.reactions VALUES (134, 1718530860, NULL, 43, 'comment', 1, '2024-06-27 18:51:12.76');
INSERT INTO public.reactions VALUES (257, 1718530860, 72, NULL, 'post', 1, '2024-07-01 12:20:02.302');
INSERT INTO public.reactions VALUES (133, 1718530860, 66, NULL, 'post', 1, '2024-06-27 18:51:11.262');
INSERT INTO public.reactions VALUES (263, 1718530860, 68, NULL, 'post', 0, '2024-07-01 17:18:15.385');
INSERT INTO public.reactions VALUES (137, 1717958178, 71, NULL, 'post', -1, '2024-07-01 10:49:19.875');
INSERT INTO public.reactions VALUES (264, 1718530860, 74, NULL, 'post', 0, '2024-07-01 17:18:18.464');
INSERT INTO public.reactions VALUES (138, 1717958178, 68, NULL, 'post', 1, '2024-07-01 10:49:21.666');
INSERT INTO public.reactions VALUES (139, 1717958178, 62, NULL, 'post', -1, '2024-07-01 10:49:23.059');
INSERT INTO public.reactions VALUES (140, 1717958178, 76, NULL, 'post', 1, '2024-07-01 10:49:28.371');
INSERT INTO public.reactions VALUES (142, 1717958178, 74, NULL, 'post', -1, '2024-07-01 10:49:32.586');
INSERT INTO public.reactions VALUES (143, 1717958178, 75, NULL, 'post', 1, '2024-07-01 10:49:35.156');
INSERT INTO public.reactions VALUES (144, 1717958178, 70, NULL, 'post', 1, '2024-07-01 10:49:35.925');
INSERT INTO public.reactions VALUES (265, 1718530860, 69, NULL, 'post', 0, '2024-07-01 17:18:21.2');
INSERT INTO public.reactions VALUES (258, 1718530860, 71, NULL, 'post', 1, '2024-07-01 12:20:08.854');
INSERT INTO public.reactions VALUES (147, 1717958178, NULL, 42, 'comment', -1, '2024-07-01 11:32:08.429');
INSERT INTO public.reactions VALUES (146, 1717958178, 67, NULL, 'post', -1, '2024-07-01 10:49:37.347');
INSERT INTO public.reactions VALUES (136, 1717958178, 69, NULL, 'post', 0, '2024-07-01 10:49:15.799');
INSERT INTO public.reactions VALUES (141, 1717958178, 73, NULL, 'post', 0, '2024-07-01 10:49:31.036');
INSERT INTO public.reactions VALUES (261, 1718530860, 73, NULL, 'post', -1, '2024-07-01 12:20:12.549');
INSERT INTO public.reactions VALUES (259, 1718530860, 70, NULL, 'post', -1, '2024-07-01 12:20:10.024');
INSERT INTO public.reactions VALUES (266, 1718530860, 76, NULL, 'post', 0, '2024-07-01 17:18:30.225');
INSERT INTO public.reactions VALUES (129, 1718530860, 62, NULL, 'post', -1, '2024-06-27 18:29:29.416');
INSERT INTO public.reactions VALUES (153, 1, 60, NULL, 'post', 1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (154, 1, 70, NULL, 'post', 1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (260, 1718530860, 67, NULL, 'post', 1, '2024-07-01 12:20:11.35');
INSERT INTO public.reactions VALUES (155, 2, 66, NULL, 'post', 1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (156, 2, 71, NULL, 'post', -1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (157, 3, 62, NULL, 'post', 1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (158, 3, 67, NULL, 'post', 1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (159, 3, 72, NULL, 'post', -1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (160, 11, 74, NULL, 'post', 1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (161, 11, 75, NULL, 'post', -1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (262, 1718530860, 75, NULL, 'post', -1, '2024-07-01 12:20:13.391');
INSERT INTO public.reactions VALUES (162, 11, 76, NULL, 'post', 1, '2024-07-01 12:10:06.475342');
INSERT INTO public.reactions VALUES (181, 1, 62, NULL, 'post', 1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (182, 1, 70, NULL, 'post', -1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (183, 1, 75, NULL, 'post', 1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (184, 2, 60, NULL, 'post', -1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (185, 2, 68, NULL, 'post', 1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (186, 2, 76, NULL, 'post', -1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (187, 3, 71, NULL, 'post', 1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (188, 3, 74, NULL, 'post', -1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (189, 4, 69, NULL, 'post', 1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (125, 1719512917, 60, NULL, 'post', 1, '2024-06-27 18:29:06.249');
INSERT INTO public.reactions VALUES (126, 1719512917, 62, NULL, 'post', 1, '2024-06-27 18:29:07.513');
INSERT INTO public.reactions VALUES (190, 4, 73, NULL, 'post', -1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (191, 5, 67, NULL, 'post', -1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (192, 5, 72, NULL, 'post', 1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (193, 11, 66, NULL, 'post', -1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (194, 11, 76, NULL, 'post', 1, '2024-07-01 12:12:05.879313');
INSERT INTO public.reactions VALUES (199, 1, 60, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (200, 1, 66, NULL, 'post', -1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (201, 1, 72, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (202, 2, 67, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (203, 2, 73, NULL, 'post', -1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (204, 3, 68, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (205, 3, 74, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (206, 3, 76, NULL, 'post', -1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (207, 4, 69, NULL, 'post', -1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (208, 4, 71, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (209, 4, 75, NULL, 'post', -1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (210, 5, 60, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (211, 5, 70, NULL, 'post', -1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (212, 5, 76, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (213, 11, 66, NULL, 'post', -1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (214, 11, 75, NULL, 'post', 1, '2024-07-01 12:13:23.179352');
INSERT INTO public.reactions VALUES (215, 6, 60, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (216, 6, 66, NULL, 'post', -1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (217, 6, 72, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (218, 7, 67, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (219, 7, 73, NULL, 'post', -1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (220, 8, 68, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (221, 8, 74, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (222, 8, 76, NULL, 'post', -1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (223, 9, 69, NULL, 'post', -1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (224, 9, 71, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (225, 9, 75, NULL, 'post', -1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (226, 10, 60, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (227, 10, 70, NULL, 'post', -1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (228, 10, 76, NULL, 'post', 1, '2024-07-01 12:14:15.071358');
INSERT INTO public.reactions VALUES (230, 6, 68, NULL, 'post', 1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (231, 6, 76, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (232, 7, 60, NULL, 'post', 1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (233, 7, 73, NULL, 'post', 1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (234, 7, 69, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (235, 8, 75, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (236, 8, 70, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (237, 9, 74, NULL, 'post', 1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (238, 9, 66, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (239, 9, 72, NULL, 'post', 1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (240, 10, 67, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (241, 10, 76, NULL, 'post', 1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (242, 10, 60, NULL, 'post', -1, '2024-07-01 12:15:26.671586');
INSERT INTO public.reactions VALUES (267, 1717958178, 66, NULL, 'post', -1, '2024-07-02 08:09:02.599');
INSERT INTO public.reactions VALUES (128, 1718530860, 60, NULL, 'post', 1, '2024-06-27 18:29:27.88');
INSERT INTO public.reactions VALUES (135, 1717958178, 60, NULL, 'post', 1, '2024-07-01 10:16:47.669');
INSERT INTO public.reactions VALUES (268, 1717958178, 77, NULL, 'post', 1, '2024-07-02 08:47:43.351');
INSERT INTO public.reactions VALUES (269, 1719932983, 77, NULL, 'post', 1, '2024-07-02 15:14:02.132');
INSERT INTO public.reactions VALUES (145, 1717958178, 72, NULL, 'post', 1, '2024-07-01 10:49:36.547');
INSERT INTO public.reactions VALUES (270, 1719932983, 66, NULL, 'post', -1, '2024-07-02 15:14:10.35');
INSERT INTO public.reactions VALUES (271, 1719932983, 70, NULL, 'post', -1, '2024-07-02 15:14:12.459');
INSERT INTO public.reactions VALUES (272, 1719932983, 76, NULL, 'post', 1, '2024-07-02 15:14:14.402');
INSERT INTO public.reactions VALUES (273, 1719932983, 73, NULL, 'post', 1, '2024-07-02 15:14:16.818');
INSERT INTO public.reactions VALUES (274, 1719932983, 69, NULL, 'post', -1, '2024-07-02 15:14:18.027');
INSERT INTO public.reactions VALUES (275, 1719932983, 71, NULL, 'post', 1, '2024-07-02 15:14:19.793');
INSERT INTO public.reactions VALUES (276, 1719932983, 60, NULL, 'post', 1, '2024-07-02 15:14:21.158');
INSERT INTO public.reactions VALUES (277, 1719932983, 74, NULL, 'post', 1, '2024-07-02 15:14:24.127');
INSERT INTO public.reactions VALUES (278, 1719997018, 60, NULL, 'post', 1, '2024-07-03 08:57:02.788');
INSERT INTO public.reactions VALUES (279, 1719997018, 72, NULL, 'post', 1, '2024-07-03 08:57:04.934');
INSERT INTO public.reactions VALUES (280, 1719997018, 66, NULL, 'post', -1, '2024-07-03 08:57:05.647');
INSERT INTO public.reactions VALUES (281, 1719997018, 68, NULL, 'post', 1, '2024-07-03 08:57:07.142');
INSERT INTO public.reactions VALUES (282, 1719997018, 69, NULL, 'post', 1, '2024-07-03 08:57:08.262');
INSERT INTO public.reactions VALUES (283, 1719997018, 78, NULL, 'post', 1, '2024-07-03 08:58:53.99');
INSERT INTO public.reactions VALUES (284, 1717958178, NULL, 45, 'comment', 1, '2024-07-03 08:59:04.87');
INSERT INTO public.reactions VALUES (285, 1719932983, 72, NULL, 'post', 1, '2024-07-03 09:57:13.018');
INSERT INTO public.reactions VALUES (286, 1717958178, NULL, 46, 'comment', 1, '2024-07-03 09:57:30.672');
INSERT INTO public.reactions VALUES (287, 1720000684, 95, NULL, 'post', 1, '2024-07-03 09:58:42.472');


--
-- TOC entry 3647 (class 0 OID 16574)
-- Dependencies: 215
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: ubreglia
--

INSERT INTO public.sessions VALUES ('HGPXNHCL23W7AFDPH4Y4UJA3', 30, 1720000684);


--
-- TOC entry 3648 (class 0 OID 16579)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ubreglia
--

INSERT INTO public.users VALUES (1717958178, 'q', '$argon2id$v=19$m=19456,t=2,p=1$jocE4iqoaeK8+e9qelOH+g$IGn6ywQTKEbpCCuB0Ol5iGDnUJJkdFFXzNXgzaSvS7s');
INSERT INTO public.users VALUES (1718530860, 'graffioh', '$argon2id$v=19$m=19456,t=2,p=1$PFCkizuIrzIYSAAwZ/ln+g$MGrjGYpW54Mr4FmBIp9f81i5yZbwrylTzJlOLTWVuBg');
INSERT INTO public.users VALUES (1718964866, 'baggio', '$argon2id$v=19$m=19456,t=2,p=1$b5I1+264fMhaf50gpFvw2Q$ykb/XU1fUVTjl5g+iMGtK2/t7rxjzrMozabyoHM1Fu4');
INSERT INTO public.users VALUES (1719337324, 'Mary99', '$argon2id$v=19$m=19456,t=2,p=1$EgxRGw386ziaq8NkXPYRag$TJGc4aV+JTYPW/7gyp1tUCy7CnIcOGTcvL3AYuCoNzY');
INSERT INTO public.users VALUES (1719512917, 'wojack123', '$argon2id$v=19$m=19456,t=2,p=1$aQttwssU01MjPkN4MOTshQ$31ys2FPu2nBGLtHnB3jRrPwkYr3LXY5DmYgJyezG9pQ');
INSERT INTO public.users VALUES (1, 'retro_arcade_champ', '$2a$12$ASDFGHJKLpoiuytre');
INSERT INTO public.users VALUES (2, 'chess_grandmaster99', '$2a$12$KLMnOpQrStuVwX');
INSERT INTO public.users VALUES (3, 'synth_wave_surfer', '$2a$12$HRxWVYU4JNGHS');
INSERT INTO public.users VALUES (4, 'jazz_improv_master', '$2a$12$QWERTYUIOPasdfg');
INSERT INTO public.users VALUES (5, 'neon_ninja_gamer', '$2a$12$QfCBCZ8.N/fmZUwNZR');
INSERT INTO public.users VALUES (6, 'brush_strokes_101', '$2a$12$9ZQjhO.kW/4A1Oy');
INSERT INTO public.users VALUES (7, 'guitar_hero_rocks', '$2a$12$X3mScCMzpKHGz');
INSERT INTO public.users VALUES (8, 'pixel_painter42', '$2a$12$K8HKs.PvYfM8ZKjt5FQH8eMH6aRtxtkEB');
INSERT INTO public.users VALUES (9, 'cosmic_sculptor', '$2a$12$TvCCWj7D0GBGcGAL');
INSERT INTO public.users VALUES (10, 'melody_maestro87', '$2a$12$LQ9rvi/Q8LvTQIILOnjVb.I');
INSERT INTO public.users VALUES (11, 'botanical_explorer', '$2a$12$ZXCvbnM,./');
INSERT INTO public.users VALUES (1719932983, 'graffioh123', '$argon2id$v=19$m=19456,t=2,p=1$E83kOWcrsHlFfMvFhnSXsQ$8/3dV7AU5z6CEY1twMrCnyzK7V2F3mXlC1cvhDeOByk');
INSERT INTO public.users VALUES (1719997018, 'marco777', '$argon2id$v=19$m=19456,t=2,p=1$qC9eb3iYMHQEnlor5DLBWQ$pkgbVsgGTGYHQXiQAweDOMe4nfHYoSTjqWq6kfOqqys');
INSERT INTO public.users VALUES (1720000684, 'ciccio_graziano69', '$argon2id$v=19$m=19456,t=2,p=1$5B+34/NSUS1e9TYaW0NeAA$HRjQyAxNwvM0OVX30R1yWDDdBsJp8RX/oekeOynYRtc');


--
-- TOC entry 3658 (class 0 OID 0)
-- Dependencies: 210
-- Name: comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ubreglia
--

SELECT pg_catalog.setval('public.comments_id_seq', 46, true);


--
-- TOC entry 3659 (class 0 OID 0)
-- Dependencies: 212
-- Name: posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ubreglia
--

SELECT pg_catalog.setval('public.posts_id_seq', 95, true);


--
-- TOC entry 3660 (class 0 OID 0)
-- Dependencies: 214
-- Name: reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ubreglia
--

SELECT pg_catalog.setval('public.reactions_id_seq', 287, true);


--
-- TOC entry 3482 (class 2606 OID 16588)
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- TOC entry 3484 (class 2606 OID 16590)
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- TOC entry 3486 (class 2606 OID 16592)
-- Name: reactions reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_pkey PRIMARY KEY (id);


--
-- TOC entry 3488 (class 2606 OID 16594)
-- Name: reactions reactions_user_id_post_id_comment_id_key; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_user_id_post_id_comment_id_key UNIQUE (user_id, post_id, comment_id);


--
-- TOC entry 3490 (class 2606 OID 16596)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (token);


--
-- TOC entry 3492 (class 2606 OID 16598)
-- Name: sessions sessions_token_key; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_token_key UNIQUE (token);


--
-- TOC entry 3494 (class 2606 OID 16600)
-- Name: users unique_username; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_username UNIQUE (username);


--
-- TOC entry 3496 (class 2606 OID 16602)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3497 (class 1259 OID 16603)
-- Name: users_username; Type: INDEX; Schema: public; Owner: ubreglia
--

CREATE INDEX users_username ON public.users USING btree (username);


--
-- TOC entry 3498 (class 2606 OID 16604)
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id);


--
-- TOC entry 3499 (class 2606 OID 16609)
-- Name: reactions reactions_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- TOC entry 3500 (class 2606 OID 16614)
-- Name: reactions reactions_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.reactions
    ADD CONSTRAINT reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- TOC entry 3501 (class 2606 OID 16619)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ubreglia
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3654 (class 0 OID 0)
-- Dependencies: 4
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: ubreglia
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


-- Completed on 2024-07-03 12:07:38 CEST

--
-- PostgreSQL database dump complete
--

