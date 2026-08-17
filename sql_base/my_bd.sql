
DROP TABLE IF EXISTS public.notification CASCADE;
DROP TABLE IF EXISTS public.historique_cluster CASCADE;
DROP TABLE IF EXISTS public.cluster_cas CASCADE;
DROP TABLE IF EXISTS public.cluster_epidemique CASCADE;
DROP TABLE IF EXISTS public.symptome_cas CASCADE;
DROP TABLE IF EXISTS public.cas_maladie CASCADE;
DROP TABLE IF EXISTS public.statut CASCADE;
DROP TABLE IF EXISTS public.maladie CASCADE;
DROP TABLE IF EXISTS public.patient CASCADE;
DROP TABLE IF EXISTS public.adresse CASCADE;
DROP TABLE IF EXISTS public.utilisateur CASCADE;
DROP TABLE IF EXISTS public.role_utilisateur CASCADE;
DROP TABLE IF EXISTS public.centre_sante CASCADE;
DROP TABLE IF EXISTS public.aire_sante CASCADE;
DROP TABLE IF EXISTS public.zone_sante CASCADE;
DROP TABLE IF EXISTS public.maladie_symptome CASCADE;
DROP TABLE IF EXISTS public.piece_jointe CASCADE;
DROP TABLE IF EXISTS public.fiche_simr CASCADE;

CREATE TABLE public.zone_sante (
    id SERIAL PRIMARY KEY,
    nom character varying(100) NOT NULL,
    code character varying(50) NOT NULL UNIQUE,
    population integer,
    province character varying(100)
);

CREATE TABLE public.aire_sante (
    id SERIAL PRIMARY KEY,
    nom character varying(100) NOT NULL,
    population integer,
    latitude numeric(9,6),
    longitude numeric(9,6),
    etat character varying(20) DEFAULT 'ACTIF',
    id_zone_sante integer NOT NULL
);

CREATE TABLE public.centre_sante (
    id SERIAL PRIMARY KEY,
    nom character varying(100) NOT NULL,
    commune character varying(100),
    avenue character varying(100),
    numero character varying(20),
    type_centre character varying(50),
    latitude numeric(9,6),
    longitude numeric(9,6),
    responsable character varying(100),
    etat character varying(20) DEFAULT 'ACTIF',
    id_aire_sante integer NOT NULL
);

CREATE TABLE public.role_utilisateur (
    id SERIAL PRIMARY KEY,
    nom character varying(50) NOT NULL UNIQUE,
    description character varying(255)
);

CREATE TABLE public.utilisateur (
    id SERIAL PRIMARY KEY,
    nom_utilisateur character varying(50) NOT NULL UNIQUE,
    mot_de_passe character varying(255) NOT NULL,
    sexe character varying(10),
    telephone character varying(20),
    creer_le timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    etat character varying(20) DEFAULT 'ACTIF',
    id_role integer NOT NULL,
    id_centre_sante integer
);

CREATE TABLE public.adresse (
    id SERIAL PRIMARY KEY,
    commune character varying(100),
    quartier character varying(100),
    avenue character varying(100),
    numero character varying(20),
    latitude numeric(9,6),
    longitude numeric(9,6),
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    niveau_precision character varying(30) DEFAULT 'INCONNU' NOT NULL
);

CREATE TABLE public.patient (
    id SERIAL PRIMARY KEY,
    nom character varying(50) NOT NULL,
    prenom character varying(50) NOT NULL,
    post_nom character varying(50),
    sexe character varying(10),
    telephone character varying(20),
    date_insertion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_adresse integer
);

CREATE TABLE public.maladie (
    id SERIAL PRIMARY KEY,
    code character varying(50) NOT NULL UNIQUE,
    nom character varying(100) NOT NULL,
    description text
);

CREATE TABLE public.statut (
    id SERIAL PRIMARY KEY,
    nom character varying(50) NOT NULL,
    code character varying(50) NOT NULL UNIQUE
);

CREATE TABLE public.cas_maladie (
    id SERIAL PRIMARY KEY,
    date_enregistrement timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_patient integer NOT NULL,
    id_maladie integer NOT NULL,
    id_centre_sante integer NOT NULL,
    id_adresse integer NOT NULL,
    id_utilisateur integer NOT NULL,
    id_statut integer NOT NULL
);

CREATE TABLE public.symptome_cas (
    id SERIAL PRIMARY KEY,
    nom_symptome character varying(100) NOT NULL,
    id_cas_maladie integer NOT NULL
);

CREATE TABLE public.cluster_epidemique (
    id SERIAL PRIMARY KEY,
    date_creation timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rayon_actuel numeric(10,2),
    nombre_cas_actuel integer,
    centre_latitude_actuel numeric(9,6),
    centre_longitude_actuel numeric(9,6),
    id_maladie integer NOT NULL,
    id_statut integer NOT NULL
);

CREATE TABLE public.cluster_cas (
    id SERIAL PRIMARY KEY,
    date_association timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_cluster integer NOT NULL,
    id_cas_maladie integer NOT NULL,
    UNIQUE (id_cluster, id_cas_maladie)
);

CREATE TABLE public.historique_cluster (
    id SERIAL PRIMARY KEY,
    date_calcul timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rayon numeric(10,2),
    nombre_cas integer,
    centre_latitude numeric(9,6),
    centre_longitude numeric(9,6),
    id_cluster integer NOT NULL
);

CREATE TABLE public.notification (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type_alerte VARCHAR(50) DEFAULT 'INFO',
    role_cible VARCHAR(50) DEFAULT 'TOUS',
    est_lue BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_cluster integer -- Lien optionnel pour lier l'alerte au foyer
);


-- =========================================================================
-- 3. CRÉATION DES CONTRAINTES D'INTÉGRITÉ (FOREIGN KEYS)
-- =========================================================================

-- Pyramide Sanitaire
ALTER TABLE public.aire_sante ADD CONSTRAINT fk_aire_zone FOREIGN KEY (id_zone_sante) REFERENCES public.zone_sante(id) ON DELETE CASCADE;
ALTER TABLE public.centre_sante ADD CONSTRAINT fk_centre_aire FOREIGN KEY (id_aire_sante) REFERENCES public.aire_sante(id) ON DELETE RESTRICT;

-- Utilisateurs
ALTER TABLE public.utilisateur ADD CONSTRAINT fk_user_role FOREIGN KEY (id_role) REFERENCES public.role_utilisateur(id) ON DELETE RESTRICT;
ALTER TABLE public.utilisateur ADD CONSTRAINT fk_user_centre FOREIGN KEY (id_centre_sante) REFERENCES public.centre_sante(id) ON DELETE RESTRICT;

-- Patients et Adresses
ALTER TABLE public.patient ADD CONSTRAINT fk_patient_adresse FOREIGN KEY (id_adresse) REFERENCES public.adresse(id) ON DELETE SET NULL;

-- Cas de Maladie
ALTER TABLE public.cas_maladie ADD CONSTRAINT fk_cas_patient FOREIGN KEY (id_patient) REFERENCES public.patient(id) ON DELETE CASCADE;
ALTER TABLE public.cas_maladie ADD CONSTRAINT fk_cas_maladie FOREIGN KEY (id_maladie) REFERENCES public.maladie(id) ON DELETE RESTRICT;
ALTER TABLE public.cas_maladie ADD CONSTRAINT fk_cas_centre FOREIGN KEY (id_centre_sante) REFERENCES public.centre_sante(id) ON DELETE RESTRICT;
ALTER TABLE public.cas_maladie ADD CONSTRAINT fk_cas_adresse FOREIGN KEY (id_adresse) REFERENCES public.adresse(id) ON DELETE RESTRICT;
ALTER TABLE public.cas_maladie ADD CONSTRAINT fk_cas_user FOREIGN KEY (id_utilisateur) REFERENCES public.utilisateur(id) ON DELETE RESTRICT;
ALTER TABLE public.cas_maladie ADD CONSTRAINT fk_cas_statut FOREIGN KEY (id_statut) REFERENCES public.statut(id) ON DELETE RESTRICT;

-- Symptômes
ALTER TABLE public.symptome_cas ADD CONSTRAINT fk_sympt_cas FOREIGN KEY (id_cas_maladie) REFERENCES public.cas_maladie(id) ON DELETE CASCADE;

-- Intelligence Artificielle (DBSCAN)
ALTER TABLE public.cluster_epidemique ADD CONSTRAINT fk_cluster_maladie FOREIGN KEY (id_maladie) REFERENCES public.maladie(id) ON DELETE CASCADE;
ALTER TABLE public.cluster_epidemique ADD CONSTRAINT fk_cluster_statut FOREIGN KEY (id_statut) REFERENCES public.statut(id) ON DELETE RESTRICT;

ALTER TABLE public.cluster_cas ADD CONSTRAINT fk_cc_cluster FOREIGN KEY (id_cluster) REFERENCES public.cluster_epidemique(id) ON DELETE CASCADE;
ALTER TABLE public.cluster_cas ADD CONSTRAINT fk_cc_cas FOREIGN KEY (id_cas_maladie) REFERENCES public.cas_maladie(id) ON DELETE CASCADE;

ALTER TABLE public.historique_cluster ADD CONSTRAINT fk_hist_cluster FOREIGN KEY (id_cluster) REFERENCES public.cluster_epidemique(id) ON DELETE CASCADE;

-- Notifications (Lien optionnel vers le Cluster)
ALTER TABLE public.notification ADD CONSTRAINT fk_notif_cluster FOREIGN KEY (id_cluster) REFERENCES public.cluster_epidemique(id) ON DELETE CASCADE;