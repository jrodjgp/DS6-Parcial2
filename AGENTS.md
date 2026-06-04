# \# Umbral Mobile, Agent Instructions

# 

# We are building Umbral, a React Native Expo Android app for a Panamanian PH/residential management concept.

# 

# \## Stack

# 

# Use Expo + React Native + TypeScript.

# Use core React Native components and StyleSheet.

# Use AsyncStorage for local persistence.

# Do not add dependencies unless explicitly requested.

# Do not modify native Android files.

# Do not touch Gradle.

# Do not use Firebase, backend services, NativeWind, Reanimated, UI kits, chart libraries, icon libraries, or navigation libraries unless explicitly approved.

# 

# \## Development mode

# 

# The app must run with:

# 

# npx expo start --go

# 

# It must work in Expo Go on Android during early development.

# 

# \## Product concept

# 

# Umbral is a warm, modern, operational PH management app.

# The academic version focuses on assets/areas of a PH and operational event history.

# 

# Main entity:

# Asset or area of the PH.

# 

# Examples:

# Bomba de agua, elevador, portón eléctrico, piscina, lobby, garita, tanque de reserva, cámaras.

# 

# Subrecord:

# Operational event.

# 

# Examples:

# Mantenimiento, incidencia, inspección, reparación, limpieza, cotización, visita técnica, garantía.

# 

# \## Required academic features

# 

# Login.

# Register.

# Seeded admin user.

# Role-based routing.

# Admin user management.

# Normal user dashboard.

# CRUD for assets.

# Asset detail with operational history.

# Add/edit/delete events linked to assets.

# Dashboard statistics calculated from stored data.

# Deleting an asset deletes or removes its linked events.

# No real database.

# All persistence must use AsyncStorage.

# 

# \## Roles

# 

# system\_admin:

# Can view, add and delete users.

# 

# manager:

# Can manage PH assets and operational events.

# 

# resident:

# Optional extra view for a casual resident experience. A resident can report incidents, but this must not break the manager flow.

# 

# \## Visual direction

# 

# Brand: Umbral.

# Avoid sterile white corporate dashboards.

# Use a warm, modern startup aesthetic.

# 

# Palette:

# Umbral Ink: #10231F

# Deep Canopy: #17443C

# Isthmus Teal: #0E7C72

# Guayacán Gold: #F2B84B

# Coral Alerta: #E76F51

# Caribe Blue: #2BA7C9

# Warm Sand: #F4EFE4

# Card Ivory: #FFF8EA

# Mist Green: #DCEAE2

# Graphite: #5A6B66

# 

# Use Spanish UI copy.

# 

# \## Done means

# 

# The app compiles.

# The app opens in Expo Go.

# TextInput works.

# No red screen errors.

# No TypeScript errors.

# No new dependency was added without approval.

# The implementation is simple enough for a student to explain.

