--
-- PostgreSQL database dump
--

\restrict 7iDZYdhDezn8E6JQucq9vceuIftV7JgSPgdivRVtid9t6fnufsbU1DGl8OP3df9

-- Dumped from database version 16.15 (Debian 16.15-1.pgdg13+2)
-- Dumped by pg_dump version 16.15 (Debian 16.15-1.pgdg13+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: charts; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.charts (
    id text NOT NULL,
    dashboard_id text NOT NULL,
    source_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    section text,
    title text NOT NULL,
    type text NOT NULL,
    x_axis_field text,
    y_axis_field text,
    color text,
    user_id text NOT NULL
);


ALTER TABLE public.charts OWNER TO admin;

--
-- Name: dashboards; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.dashboards (
    id text NOT NULL,
    name text NOT NULL,
    section_order jsonb DEFAULT '[]'::jsonb NOT NULL,
    user_id text NOT NULL,
    charts_order jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.dashboards OWNER TO admin;

--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.data_sources (
    id text NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    url_or_path text NOT NULL,
    status text,
    last_sync timestamp with time zone,
    visible_fields jsonb,
    hidden_fields jsonb,
    user_id text NOT NULL
);


ALTER TABLE public.data_sources OWNER TO admin;

--
-- Name: organizations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.organizations (
    id text NOT NULL,
    name text NOT NULL,
    invite_code text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.organizations OWNER TO admin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    organization_id text,
    role text DEFAULT 'MEMBER'::text,
    status text DEFAULT 'PENDING'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO admin;

--
-- Data for Name: charts; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.charts (id, dashboard_id, source_ids, section, title, type, x_axis_field, y_axis_field, color, user_id) FROM stdin;
BxbAp9pt7ms	_mYl8nJV5hc	["jSI5xEh713o", "6YR96yl15oA"]	Загальний	Новий графік	bar	month	revenue	#1890ff	admin
KWTGr4wWD8I	_mYl8nJV5hc	["jSI5xEh713o"]	\N	Новий графік	bar	month	revenue	#1890ff	admin
YlE1BNVNOWM	_mYl8nJV5hc	["jSI5xEh713o"]	\N	Новий графік 1	pie	month	revenue	#1890ff	admin
CrzHSlc5QHU	_mYl8nJV5hc	["jSI5xEh713o"]	Test	Новий графік	bar	month	revenue	#0084ff	admin
7h_GciohFKM	_mYl8nJV5hc	["jSI5xEh713o", "6YR96yl15oA"]	Загальний	Новий графік	bar	month	revenue	#1890ff	admin
y9593pE	_mYl8nJV5hc	["0ik55QfwBB0"]	Test	Новий графік	bar	category	count	#000b14	admin
r5z5FnBm184	_mYl8nJV5hc	["jSI5xEh713o"]	Загальний	Новий графік	bar	month	revenue	#1890ff	admin
iPbccMFHQas	KkUn5f1trRA	["AylGGDbvOa8"]	Загальний	Новий графік	bar	month	revenue	#1890ff	iw9Y9acC4KjLREAM4ZaewZXZqm_jYJnn0ovTjKfhgxw
\.


--
-- Data for Name: dashboards; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.dashboards (id, name, section_order, user_id, charts_order) FROM stdin;
_mYl8nJV5hc	Test	["Загальний", "Test"]	admin	{"Загальний": [{"id": "7h_GciohFKM", "span": 12}, {"id": "KWTGr4wWD8I", "span": 12}, {"id": "BxbAp9pt7ms", "span": 24}, {"id": "YlE1BNVNOWM", "span": 12}, {"id": "r5z5FnBm184", "span": 12}]}
KkUn5f1trRA	1	[]	iw9Y9acC4KjLREAM4ZaewZXZqm_jYJnn0ovTjKfhgxw	{}
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.data_sources (id, name, type, url_or_path, status, last_sync, visible_fields, hidden_fields, user_id) FROM stdin;
yTwbsfroHv0	тест	csv	halych.csv	active	2026-10-22 09:19:46.462+00	["Місяць", "Дохід", "Витрати", "Клієнти"]	[]	admin
0ik55QfwBB0	Тест 2	rest	http://localhost:3001/users-demographics	active	\N	["category", "count"]	["id"]	admin
NJniqTy2UMY	sensors-v1	rest	http://localhost:3001/sensors	active	\N	\N	\N	admin
jSI5xEh713o	sales-v1	rest	http://localhost:3001/sales	active	\N	["month", "revenue", "orders"]	["id"]	admin
6YR96yl15oA	sales-v2	rest	http://localhost:3002/sales	active	2026-10-23 05:18:59.043+00	["month", "revenue", "orders"]	["id"]	admin
6vFEiDtYvs4	444444	rest	admin@example.com	error	2026-10-27 13:01:43.703+00	\N	\N	admin
AylGGDbvOa8	1111	rest	http://localhost:3001/sales	active	2026-10-27 14:03:48.595+00	["month", "revenue", "orders"]	[]	iw9Y9acC4KjLREAM4ZaewZXZqm_jYJnn0ovTjKfhgxw
\.


--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.organizations (id, name, invite_code, created_at) FROM stdin;
EV0p9kno	Test Organization	ORG-D99339	2026-10-27 13:38:50.891498+00
HPjBEwpx4QoF3aTBLnd0j0PCKDhrbw7JnkINfWJ9cPg	Test Organization	ORG-DD8805	2026-10-27 13:42:36.708369+00
zhIkSjGbI8sfFEp-Y-ThWbzF2EN6IBKuXBbEDSw5Sns	Test Organization	ORG-253386	2026-10-27 13:43:48.218417+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.users (id, email, password, organization_id, role, status, created_at) FROM stdin;
admin	admin@example.com	admin	\N	MEMBER	PENDING	2026-10-27 13:31:20.21587+00
iw9Y9acC4KjLREAM4ZaewZXZqm_jYJnn0ovTjKfhgxw	admin_login_1@example.com	$2b$10$Vi8zE.l0ED4XchmPzi3CwOka6dCBj.UzSgoizFJ3Tb5AynikEk1ve	zhIkSjGbI8sfFEp-Y-ThWbzF2EN6IBKuXBbEDSw5Sns	ADMIN	ACTIVE	2026-10-27 13:43:48.298215+00
RFZX-YHu	admin_login@example.com	$2b$10$6dJQCRqSrvwrzIA8zcK9wekscmgTd033iuULl4KZ4P5Fd/Kag321.	EV0p9kno	ADMIN	ACTIVE	2026-10-27 13:38:50.979151+00
\.


--
-- Name: charts charts_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.charts
    ADD CONSTRAINT charts_pkey PRIMARY KEY (id);


--
-- Name: dashboards dashboards_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.dashboards
    ADD CONSTRAINT dashboards_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_invite_code_key UNIQUE (invite_code);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (email);


--
-- PostgreSQL database dump complete
--

\unrestrict 7iDZYdhDezn8E6JQucq9vceuIftV7JgSPgdivRVtid9t6fnufsbU1DGl8OP3df9

