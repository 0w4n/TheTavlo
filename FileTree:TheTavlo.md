# File Tree: TheTavlo

**Generated:** 10/29/2026, 12:27:17 PM
**Root Path:** `/home/jorge/code/TheTavlo`

```
├── .github
│   └── workflows
│       └── deploy.yaml
├── backend
│   ├── src
│   │   ├── assets
│   │   │   └── fonts
│   │   │       └── NotoColorEmoji.ttf
│   │   ├── features
│   │   │   ├── cookingBook
│   │   │   │   └── cookingBook.router.ts
│   │   │   ├── dirtyNote
│   │   │   │   └── dirtyNote.router.ts
│   │   │   ├── events
│   │   │   │   └── events.router.ts
│   │   │   ├── invitations
│   │   │   │   ├── invitations.router.ts
│   │   │   │   └── migration.router.ts
│   │   │   ├── note
│   │   │   │   └── notes.router.ts
│   │   │   ├── panels
│   │   │   │   └── panels.router.ts
│   │   │   ├── plugins
│   │   │   │   ├── app
│   │   │   │   │   └── sync.service.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── manifest.schema.ts
│   │   │   │   │   ├── plugin.rules.ts
│   │   │   │   │   └── plugin.types.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── buildDispatcher.ts
│   │   │   │   │   ├── ciCallback.express.ts
│   │   │   │   │   ├── github.client.ts
│   │   │   │   │   └── pluginStore.firestore.ts
│   │   │   │   ├── marketplace
│   │   │   │   │   └── marketplace.router.ts
│   │   │   │   ├── runtime
│   │   │   │   │   └── runtime.router.ts
│   │   │   │   └── plugins.router.ts
│   │   │   ├── schedule
│   │   │   │   └── schedule.router.ts
│   │   │   ├── suggestions
│   │   │   │   ├── actions
│   │   │   │   │   ├── actions.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── emojis
│   │   │   │   │   ├── getEmoji.test.ts
│   │   │   │   │   ├── getEmoji.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── getSchedule.ts
│   │   │   │   └── suggestions.router.ts
│   │   │   ├── task
│   │   │   │   └── tasks.router.ts
│   │   │   └── widgets
│   │   │       └── widgets.router.ts
│   │   ├── firebase
│   │   │   ├── config.ts
│   │   │   └── firebase.rules
│   │   ├── router
│   │   │   ├── api.ts
│   │   │   └── user.ts
│   │   ├── services
│   │   │   └── resend.ts
│   │   ├── trpc
│   │   │   ├── allowlist.middleware.ts
│   │   │   ├── appCheck.middleware.ts
│   │   │   ├── context.ts
│   │   │   ├── root.router.ts
│   │   │   ├── trpc.ts
│   │   │   └── validate.ts
│   │   ├── example.http
│   │   └── index.ts
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── example.env
│   ├── nodemon.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   └── tsconfig.json
├── client
│   ├── .vite
│   │   └── deps
│   │       ├── _metadata.json
│   │       └── package.json
│   ├── public
│   │   ├── TheTavlo_logo_favicon_dark.ico
│   │   ├── TheTavlo_logo_favicon_light.ico
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── src
│   │   ├── assets
│   │   │   └── TheTavlo_logo.svg
│   │   ├── components
│   │   │   ├── atoms
│   │   │   │   ├── badge
│   │   │   │   │   ├── badge.css
│   │   │   │   │   ├── badge.tsx
│   │   │   │   │   ├── badge.types.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── button
│   │   │   │   │   ├── button.css
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── chart
│   │   │   │   │   ├── chart.css
│   │   │   │   │   ├── chart.tsx
│   │   │   │   │   ├── chart.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── checkbox
│   │   │   │   │   ├── checkbox.css
│   │   │   │   │   ├── checkbox.tsx
│   │   │   │   │   ├── checkbox.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── datetimebadge
│   │   │   │   │   ├── datetimebadge.css
│   │   │   │   │   ├── datetimebadge.tsx
│   │   │   │   │   ├── datetimebadge.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── input
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── input.css
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   └── input.types.ts
│   │   │   │   ├── quote
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── quote.css
│   │   │   │   │   ├── quote.tsx
│   │   │   │   │   └── quote.types.ts
│   │   │   │   ├── tags
│   │   │   │   │   ├── Tag.tsx
│   │   │   │   │   └── Tag.types.ts
│   │   │   │   └── userAvatar
│   │   │   │       ├── UserAvatar.test.tsx
│   │   │   │       └── UserAvatar.tsx
│   │   │   ├── base
│   │   │   │   ├── colors.css
│   │   │   │   ├── reset.css
│   │   │   │   └── typography.css
│   │   │   ├── molecules
│   │   │   │   ├── acordion
│   │   │   │   │   ├── acordion.css
│   │   │   │   │   ├── acordion.tsx
│   │   │   │   │   └── acordion.types.tsx
│   │   │   │   ├── alert
│   │   │   │   │   ├── alert.css
│   │   │   │   │   ├── alert.tsx
│   │   │   │   │   ├── alert.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── breadcrumb
│   │   │   │   │   ├── breadcrumb.css
│   │   │   │   │   └── breadcrumb.tsx
│   │   │   │   ├── card
│   │   │   │   │   ├── card.css
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── card.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── dropdown
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── divider
│   │   │   │   │   │   │   ├── divider.css
│   │   │   │   │   │   │   ├── divider.tsx
│   │   │   │   │   │   │   └── divider.types.ts
│   │   │   │   │   │   ├── item
│   │   │   │   │   │   │   ├── item.css
│   │   │   │   │   │   │   ├── item.tsx
│   │   │   │   │   │   │   └── item.types.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── dropdown.css
│   │   │   │   │   ├── dropdown.tsx
│   │   │   │   │   ├── dropdown.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── formfield
│   │   │   │   │   ├── formfield.tsx
│   │   │   │   │   ├── formfield.types.ts
│   │   │   │   │   ├── formfiled.css
│   │   │   │   │   └── index.ts
│   │   │   │   ├── modal
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── body
│   │   │   │   │   │   │   ├── body.css
│   │   │   │   │   │   │   ├── body.tsx
│   │   │   │   │   │   │   └── body.types.ts
│   │   │   │   │   │   ├── footer
│   │   │   │   │   │   │   ├── footer.css
│   │   │   │   │   │   │   ├── footer.tsx
│   │   │   │   │   │   │   └── footer.types.ts
│   │   │   │   │   │   ├── header
│   │   │   │   │   │   │   ├── header.css
│   │   │   │   │   │   │   ├── header.tsx
│   │   │   │   │   │   │   └── header.types.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── portal
│   │   │   │   │   │   ├── index.tsx
│   │   │   │   │   │   └── modalPortal.types.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── modal.context.ts
│   │   │   │   │   ├── modal.css
│   │   │   │   │   ├── modal.tsx
│   │   │   │   │   ├── modal.types.ts
│   │   │   │   │   └── put.css
│   │   │   │   ├── rise
│   │   │   │   │   ├── delt
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── put.tsx
│   │   │   │   │   ├── rise.css
│   │   │   │   │   ├── rise.tsx
│   │   │   │   │   └── rise.types.tsx
│   │   │   │   ├── selector
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── selector.tsx
│   │   │   │   │   └── selector.typs.ts
│   │   │   │   ├── toolbar
│   │   │   │   │   ├── toolBar.css
│   │   │   │   │   └── toolBar.tsx
│   │   │   │   └── tooltip
│   │   │   │       ├── index.ts
│   │   │   │       ├── tooltip.css
│   │   │   │       ├── tooltip.tsx
│   │   │   │       └── tooltip.types.ts
│   │   │   ├── organisms
│   │   │   │   ├── dashboard
│   │   │   │   │   ├── dashboard.css
│   │   │   │   │   ├── dashboard.tsx
│   │   │   │   │   ├── dashboard.types.ts
│   │   │   │   │   ├── dashboardLayout.test.ts
│   │   │   │   │   ├── dashboardLayout.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── emptyState
│   │   │   │   │   ├── emptystate.css
│   │   │   │   │   ├── emptystate.tsx
│   │   │   │   │   ├── emptystate.types.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── gridOverlay
│   │   │   │   │   └── GridOverlay.tsx
│   │   │   │   ├── header
│   │   │   │   │   ├── header.css
│   │   │   │   │   ├── header.tsx
│   │   │   │   │   ├── header.types.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── userMenuAction.tsx
│   │   │   │   └── panelLocationBar
│   │   │   │       ├── panelLocationBar.css
│   │   │   │       └── panelLocationBar.tsx
│   │   │   ├── pages
│   │   │   │   ├── error
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── style.css
│   │   │   │   ├── onBoarding
│   │   │   │   │   ├── SelectionTagForm.tsx
│   │   │   │   │   ├── WelcomeForm.tsx
│   │   │   │   │   └── onBoardingPage.tsx
│   │   │   │   ├── CalendarPage.tsx
│   │   │   │   ├── Comming.tsx
│   │   │   │   ├── HomePage.test.tsx
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── LandingPage.css
│   │   │   │   ├── LandingPage.tsx
│   │   │   │   ├── LandingPricing.css
│   │   │   │   ├── LandingPricing.tsx
│   │   │   │   ├── LandingShowcase.css
│   │   │   │   ├── LandingShowcase.tsx
│   │   │   │   ├── LoadingPage.css
│   │   │   │   ├── LoadingPage.tsx
│   │   │   │   ├── LoginPage.css
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   ├── NotFoundPage.css
│   │   │   │   ├── NotFoundPage.tsx
│   │   │   │   ├── PanelRoute.test.tsx
│   │   │   │   ├── PanelRoute.tsx
│   │   │   │   └── TaskListPage.tsx
│   │   │   ├── templates
│   │   │   │   └── dialog
│   │   │   │       ├── modEvent
│   │   │   │       │   ├── addEvent.css
│   │   │   │       │   └── addEvent.tsx
│   │   │   │       └── modShared
│   │   │   │           ├── addShared.css
│   │   │   │           ├── addShared.tsx
│   │   │   │           └── addShared.type.ts
│   │   │   ├── MigrationDialog.tsx
│   │   │   ├── ThemeSettingsDialog.tsx
│   │   │   └── ThemeToggleButton.tsx
│   │   ├── core
│   │   │   ├── a11y
│   │   │   │   ├── AnnouncerProvider.tsx
│   │   │   │   ├── announcerContext.ts
│   │   │   │   └── useAnnounce.ts
│   │   │   ├── appCore
│   │   │   │   ├── app
│   │   │   │   ├── domain
│   │   │   │   │   ├── AppCore.mapper.ts
│   │   │   │   │   └── AppCore.type.ts
│   │   │   │   └── infrastructure
│   │   │   │       ├── api
│   │   │   │       │   ├── trpcClient.test.ts
│   │   │   │       │   └── trpcClient.ts
│   │   │   │       └── firebase
│   │   │   │           ├── firebaseConfig.ts
│   │   │   │           └── withoutId.ts
│   │   │   ├── auth
│   │   │   │   ├── app
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── authRepository.interface.ts
│   │   │   │   │   └── migrationRepository.interface.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── migration.entity.ts
│   │   │   │   │   └── user.entity.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── authRepository.firebase.ts
│   │   │   │   │   ├── migrationRepository.firebase.ts
│   │   │   │   │   └── migrationRepository.trpc.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── authContext.tsx
│   │   │   │       │   └── authReducer.ts
│   │   │   │       └── hooks
│   │   │   │           └── useAuth.ts
│   │   │   ├── globalContext
│   │   │   │   ├── context
│   │   │   │   │   ├── globalContex.type.ts
│   │   │   │   │   ├── globalContext.tsx
│   │   │   │   │   ├── globalContextReducer.test.ts
│   │   │   │   │   └── globalContextReducer.ts
│   │   │   │   ├── hooks
│   │   │   │   │   └── useGlobalContext.ts
│   │   │   │   └── resolvePanelOwner.ts
│   │   │   ├── providers
│   │   │   │   └── composeProviders.tsx
│   │   │   └── routing
│   │   │       ├── loaders
│   │   │       │   ├── getCurrentUser.ts
│   │   │       │   ├── invitation.loader.ts
│   │   │       │   ├── panel.loader.test.ts
│   │   │       │   ├── panel.loader.ts
│   │   │       │   └── sharedPanel.loader.ts
│   │   │       ├── appRouter.tsx
│   │   │       ├── panelPath.test.ts
│   │   │       ├── panelPath.ts
│   │   │       ├── returnTo.ts
│   │   │       ├── routes.tsx
│   │   │       └── useDocumentTitle.ts
│   │   ├── features
│   │   │   ├── actions
│   │   │   │   ├── app
│   │   │   │   ├── components
│   │   │   │   │   ├── modal
│   │   │   │   │   │   ├── setActions.css
│   │   │   │   │   │   └── setActions.tsx
│   │   │   │   │   └── widget
│   │   │   │   │       └── widget.tsx
│   │   │   │   └── domain
│   │   │   ├── cookingBook
│   │   │   │   ├── app
│   │   │   │   │   ├── CookingBook.interface.ts
│   │   │   │   │   └── CookingBook.service.ts
│   │   │   │   ├── components
│   │   │   │   │   └── template
│   │   │   │   │       └── widget
│   │   │   │   │           ├── CookingBook.tsx
│   │   │   │   │           ├── CookingBook.type.ts
│   │   │   │   │           └── CookingBook.widget.meta.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── CookingBook.entity.ts
│   │   │   │   │   ├── CookingRecipe.entity.ts
│   │   │   │   │   └── CookingRecipe.rules.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── CookingBookRepository.firebase.ts
│   │   │   │   │   ├── cookingBook.converter.ts
│   │   │   │   │   └── cookingBookRepository.trpc.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── CookingBookReducer.ts
│   │   │   │       │   └── CookingContext.tsx
│   │   │   │       └── hooks
│   │   │   │           └── useCookingBook.ts
│   │   │   ├── dirtyNote
│   │   │   │   ├── app
│   │   │   │   │   ├── DirtyNote.service.ts
│   │   │   │   │   └── DirtyNoteRepository.interface.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── molecules
│   │   │   │   │   │   ├── markdownEditor
│   │   │   │   │   │   │   ├── __tests__
│   │   │   │   │   │   │   │   ├── MarkdownTextarea.test.tsx
│   │   │   │   │   │   │   │   └── markdownActions.test.ts
│   │   │   │   │   │   │   ├── MarkdownTextarea.tsx
│   │   │   │   │   │   │   ├── MarkdownToolbar.tsx
│   │   │   │   │   │   │   ├── markdownActions.ts
│   │   │   │   │   │   │   └── markdownEditor.css
│   │   │   │   │   │   ├── DirtyNotePreview.tsx
│   │   │   │   │   │   ├── DirtyNoteStatusBadge.tsx
│   │   │   │   │   │   ├── DirtyNoteStatusPicker.tsx
│   │   │   │   │   │   ├── dirtyNotePreview.css
│   │   │   │   │   │   ├── dirtyNoteStatus.css
│   │   │   │   │   │   └── dirtyNoteStatus.meta.ts
│   │   │   │   │   └── templates
│   │   │   │   │       ├── editor
│   │   │   │   │       │   ├── DirtyNoteEditor.tsx
│   │   │   │   │       │   └── dirtyNoteEditor.css
│   │   │   │   │       ├── modal
│   │   │   │   │       │   ├── addNote
│   │   │   │   │       │   │   └── index.tsx
│   │   │   │   │       │   └── delNote
│   │   │   │   │       │       └── index.tsx
│   │   │   │   │       └── widget
│   │   │   │   │           ├── AddDirtyNote.tsx
│   │   │   │   │           ├── DirtyNote.widget.meta.ts
│   │   │   │   │           ├── DirtyNote.widget.tsx
│   │   │   │   │           ├── Note.widget.meta.ts
│   │   │   │   │           ├── addDirtyNote.css
│   │   │   │   │           └── dirtyNoteWidget.css
│   │   │   │   ├── domain
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   └── DirtyNote.rules.test.ts
│   │   │   │   │   ├── DirtyNote.entity.ts
│   │   │   │   │   └── DirtyNote.rules.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── dirtyNote.converter.ts
│   │   │   │   │   ├── dirtyNotePath.ts
│   │   │   │   │   ├── dirtyNoteRepository.firebase.ts
│   │   │   │   │   └── dirtyNoteRepository.trpc.ts
│   │   │   │   ├── presentation
│   │   │   │   │   ├── context
│   │   │   │   │   │   ├── __tests__
│   │   │   │   │   │   │   └── dirtyNoteReducer.test.ts
│   │   │   │   │   │   ├── DirtyNoteContext.tsx
│   │   │   │   │   │   └── dirtyNoteReducer.ts
│   │   │   │   │   └── hooks
│   │   │   │   │       ├── __tests__
│   │   │   │   │       │   └── useDirtyNoteDraft.test.ts
│   │   │   │   │       ├── useDirtyNote.ts
│   │   │   │   │       └── useDirtyNoteDraft.ts
│   │   │   │   └── utils
│   │   │   │       ├── __tests__
│   │   │   │       │   ├── downloadDirtyNote.test.ts
│   │   │   │       │   ├── downloadFile.test.ts
│   │   │   │       │   ├── excerpt.test.ts
│   │   │   │       │   └── renderMarkdown.test.ts
│   │   │   │       ├── downloadDirtyNote.ts
│   │   │   │       ├── downloadFile.ts
│   │   │   │       ├── excerpt.ts
│   │   │   │       └── renderMarkdown.ts
│   │   │   ├── events
│   │   │   │   ├── app
│   │   │   │   │   ├── eventRepository.interface.ts
│   │   │   │   │   └── events.service.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── pages
│   │   │   │   │   │   ├── views
│   │   │   │   │   │   │   ├── DayView
│   │   │   │   │   │   │   │   ├── DayView.css
│   │   │   │   │   │   │   │   └── DayView.tsx
│   │   │   │   │   │   │   ├── MonthView
│   │   │   │   │   │   │   │   ├── MonthView.css
│   │   │   │   │   │   │   │   └── MonthView.tsx
│   │   │   │   │   │   │   └── WeekView
│   │   │   │   │   │   │       ├── WeekView.css
│   │   │   │   │   │   │       └── WeekView.tsx
│   │   │   │   │   │   ├── CalendarListPage.tsx
│   │   │   │   │   │   ├── CalendarPage.css
│   │   │   │   │   │   └── CalendarPage.tsx
│   │   │   │   │   └── templates
│   │   │   │   │       ├── DayCard
│   │   │   │   │       │   ├── DayCard.css
│   │   │   │   │       │   ├── DayCard.tsx
│   │   │   │   │       │   └── DayCard.type.ts
│   │   │   │   │       ├── EventCard
│   │   │   │   │       │   ├── EventCard.css
│   │   │   │   │       │   ├── EventCard.tsx
│   │   │   │   │       │   └── EventCard.types.ts
│   │   │   │   │       ├── dialog
│   │   │   │   │       │   └── events
│   │   │   │   │       │       └── add
│   │   │   │   │       │           ├── AddEvent.tsx
│   │   │   │   │       │           └── AddEvent.type.ts
│   │   │   │   │       └── widget
│   │   │   │   │           ├── ExamsTimelineWidget.tsx
│   │   │   │   │           ├── ExamsTimelineWidget.widget.meta.ts
│   │   │   │   │           ├── examsTimelineWidget.css
│   │   │   │   │           └── examsTimelineWidget.types.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── calendarEvent.entity.ts
│   │   │   │   │   └── events.entity.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── event.converter.ts
│   │   │   │   │   ├── eventRepository.firebase.ts
│   │   │   │   │   └── eventRepository.trpc.ts
│   │   │   │   ├── presentation
│   │   │   │   │   ├── context
│   │   │   │   │   │   ├── eventContext.tsx
│   │   │   │   │   │   ├── eventContext.type.ts
│   │   │   │   │   │   └── eventReducer.ts
│   │   │   │   │   └── hooks
│   │   │   │   │       └── useEvents.ts
│   │   │   │   └── utils
│   │   │   │       └── dateutils.ts
│   │   │   ├── invitations
│   │   │   │   ├── app
│   │   │   │   │   ├── invitation.service.ts
│   │   │   │   │   └── invitationRepository.interface.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── invitation.entity.ts
│   │   │   │   │   └── invitation.mapper.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── invitation.converter.ts
│   │   │   │   │   ├── invitationApiClient.ts
│   │   │   │   │   ├── invitationRepository.firebase.ts
│   │   │   │   │   └── invitationRepository.trpc.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── invitationContext.tsx
│   │   │   │       │   └── invitationReducer.ts
│   │   │   │       ├── hooks
│   │   │   │       │   ├── useInvitation.tsx
│   │   │   │       │   └── usePanelRole.ts
│   │   │   │       └── pages
│   │   │   │           ├── InvitationGate.tsx
│   │   │   │           └── invitationGate.css
│   │   │   ├── marketplace
│   │   │   │   ├── app
│   │   │   │   ├── domain
│   │   │   │   ├── infrastructure
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       └── hooks
│   │   │   ├── onBoarding
│   │   │   │   ├── components
│   │   │   │   │   ├── molecule
│   │   │   │   │   │   └── choiceCard
│   │   │   │   │   │       └── ChoiceCard.tsx
│   │   │   │   │   └── pages
│   │   │   │   │       ├── onBoardingStep
│   │   │   │   │       │   ├── auth.step.tsx
│   │   │   │   │       │   ├── firstTask.step.tsx
│   │   │   │   │       │   ├── goals.step.tsx
│   │   │   │   │       │   ├── space.step.tsx
│   │   │   │   │       │   └── starter.step.tsx
│   │   │   │   │       ├── OnboardingPage.css
│   │   │   │   │       ├── OnboardingPage.tsx
│   │   │   │   │       ├── SelectionTagForm.tsx
│   │   │   │   │       └── WelcomeForm.tsx
│   │   │   │   ├── domain
│   │   │   │   │   └── onBoarding.entity.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   └── onBoardingStorage.ts
│   │   │   │   └── presentation
│   │   │   │       └── hooks
│   │   │   │           └── useOnBoardingBootstrap.ts
│   │   │   ├── panels
│   │   │   │   ├── app
│   │   │   │   │   ├── panels.service.test.ts
│   │   │   │   │   ├── panels.service.ts
│   │   │   │   │   └── panelsRepository.interface.ts
│   │   │   │   ├── components
│   │   │   │   │   └── templates
│   │   │   │   │       └── widget
│   │   │   │   │           ├── addPanel
│   │   │   │   │           │   ├── addPanels.css
│   │   │   │   │           │   └── addPanels.tsx
│   │   │   │   │           ├── PanelsListWidget.tsx
│   │   │   │   │           ├── PanelsListWidget.widget.meta.ts
│   │   │   │   │           ├── addPanels.css
│   │   │   │   │           ├── addPanels.tsx
│   │   │   │   │           ├── panelsWidget.css
│   │   │   │   │           ├── panelsWidget.tsx
│   │   │   │   │           └── panelsWidget.type.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── panel.entity.ts
│   │   │   │   │   ├── panel.mapper.ts
│   │   │   │   │   ├── panel.rules.ts
│   │   │   │   │   ├── panelChain.validator.test.ts
│   │   │   │   │   ├── panelChain.validator.ts
│   │   │   │   │   └── panelContext.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── __fixtures__
│   │   │   │   │   │   └── fakePanelRepository.ts
│   │   │   │   │   ├── panel.converter.ts
│   │   │   │   │   ├── panelRepository.cached.test.ts
│   │   │   │   │   ├── panelRepository.cached.ts
│   │   │   │   │   ├── panelRepository.firebase.ts
│   │   │   │   │   ├── panelRepository.trpc.ts
│   │   │   │   │   ├── panelsCache.test.ts
│   │   │   │   │   └── panelsCache.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── panelReducer.ts
│   │   │   │       │   ├── panelsContext.tsx
│   │   │   │       │   └── panelsContext.types.ts
│   │   │   │       └── hooks
│   │   │   │           ├── useOpenTaskList.ts
│   │   │   │           └── usePanels.ts
│   │   │   ├── plugins
│   │   │   │   ├── components
│   │   │   │   │   ├── PanelPluginHost.tsx
│   │   │   │   │   ├── PluginInstanceView.tsx
│   │   │   │   │   ├── SandboxedPluginFrame.tsx
│   │   │   │   │   └── pluginFrame.css
│   │   │   │   ├── domain
│   │   │   │   │   ├── hostProtocol.ts
│   │   │   │   │   ├── plugin.rules.ts
│   │   │   │   │   └── plugin.types.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── bundleLoader.ts
│   │   │   │   │   └── pluginsRuntime.trpc.ts
│   │   │   │   ├── marketplace
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── InstallDialog.tsx
│   │   │   │   │   │   ├── MarketplacePage.tsx
│   │   │   │   │   │   ├── PluginCard.tsx
│   │   │   │   │   │   ├── PluginPicker.tsx
│   │   │   │   │   │   └── marketplace.css
│   │   │   │   │   ├── domain
│   │   │   │   │   │   └── marketplace.types.ts
│   │   │   │   │   ├── infrastructure
│   │   │   │   │   │   └── marketplaceApi.trpc.ts
│   │   │   │   │   ├── presentation
│   │   │   │   │   │   └── hooks
│   │   │   │   │   │       └── useMarketplace.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── presentation
│   │   │   │   │   ├── context
│   │   │   │   │   │   ├── PluginRuntimeProvider.tsx
│   │   │   │   │   │   └── pluginRuntime.context.ts
│   │   │   │   │   └── hooks
│   │   │   │   │       └── usePluginRuntime.ts
│   │   │   │   ├── runtime
│   │   │   │   │   ├── buildSrcDoc.ts
│   │   │   │   │   ├── capabilities.ts
│   │   │   │   │   ├── hostBridge.ts
│   │   │   │   │   ├── pluginWidgetDefinition.tsx
│   │   │   │   │   └── syncWidgetRegistry.ts
│   │   │   │   └── index.ts
│   │   │   ├── schedule
│   │   │   │   ├── app
│   │   │   │   │   ├── schedule.service.test.ts
│   │   │   │   │   ├── schedule.service.ts
│   │   │   │   │   └── scheduleRepository.interface.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── __fixtures__
│   │   │   │   │   │   └── scheduleSeed.ts
│   │   │   │   │   ├── molecules
│   │   │   │   │   │   ├── AttendanceControl.tsx
│   │   │   │   │   │   └── ScheduleGate.tsx
│   │   │   │   │   ├── selectors
│   │   │   │   │   │   ├── scheduleSelectors.test.ts
│   │   │   │   │   │   └── scheduleSelectors.ts
│   │   │   │   │   └── templates
│   │   │   │   │       └── widget
│   │   │   │   │           ├── ScheduleAttendance.tsx
│   │   │   │   │           ├── ScheduleAttendance.widget.meta.ts
│   │   │   │   │           ├── ScheduleNextClass.tsx
│   │   │   │   │           ├── ScheduleNextClass.widget.meta.ts
│   │   │   │   │           ├── ScheduleToday.tsx
│   │   │   │   │           ├── ScheduleToday.widget.meta.ts
│   │   │   │   │           ├── ScheduleWeek.tsx
│   │   │   │   │           ├── ScheduleWeek.widget.meta.ts
│   │   │   │   │           ├── scheduleAttendance.css
│   │   │   │   │           ├── scheduleNextClass.css
│   │   │   │   │           ├── scheduleToday.css
│   │   │   │   │           ├── scheduleWeek.css
│   │   │   │   │           ├── scheduleWidget.css
│   │   │   │   │           └── scheduleWidgets.test.tsx
│   │   │   │   ├── domain
│   │   │   │   │   ├── attendanceRecord.entity.ts
│   │   │   │   │   ├── classSlot.entity.ts
│   │   │   │   │   ├── classSlotVersioning.test.ts
│   │   │   │   │   ├── classSlotVersioning.ts
│   │   │   │   │   ├── editScope.type.ts
│   │   │   │   │   ├── occurrenceException.entity.ts
│   │   │   │   │   ├── resolvedInstance.entity.ts
│   │   │   │   │   ├── schedule.entity.ts
│   │   │   │   │   ├── schedule.mapper.ts
│   │   │   │   │   ├── schedule.rules.ts
│   │   │   │   │   ├── scheduleResolver.test.ts
│   │   │   │   │   ├── scheduleResolver.ts
│   │   │   │   │   ├── subject.entity.ts
│   │   │   │   │   ├── weekMath.test.ts
│   │   │   │   │   └── weekMath.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── __fixtures__
│   │   │   │   │   │   └── fakeScheduleRepository.ts
│   │   │   │   │   ├── schedule.converters.ts
│   │   │   │   │   ├── scheduleCache.ts
│   │   │   │   │   ├── scheduleRepository.cached.test.ts
│   │   │   │   │   ├── scheduleRepository.cached.ts
│   │   │   │   │   ├── scheduleRepository.firebase.ts
│   │   │   │   │   └── scheduleRepository.trpc.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── context.tsx
│   │   │   │       │   ├── scheduleContext.test.tsx
│   │   │   │       │   ├── scheduleContext.tsx
│   │   │   │       │   └── scheduleReducer.ts
│   │   │   │       └── hooks
│   │   │   │           ├── useElementSize.ts
│   │   │   │           ├── useSchedule.ts
│   │   │   │           └── useScheduleNow.ts
│   │   │   ├── statistic
│   │   │   │   ├── app
│   │   │   │   │   ├── statistic.service.test.ts
│   │   │   │   │   └── statistic.service.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── atoms
│   │   │   │   │   │   ├── StatisticDistribution.tsx
│   │   │   │   │   │   ├── StatisticKpi.tsx
│   │   │   │   │   │   ├── StatisticList.tsx
│   │   │   │   │   │   ├── StatisticProgressRing.tsx
│   │   │   │   │   │   ├── StatisticSeries.tsx
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── statisticAtoms.css
│   │   │   │   │   │   └── statisticTone.ts
│   │   │   │   │   ├── molecules
│   │   │   │   │   │   ├── StatisticCard.tsx
│   │   │   │   │   │   └── statisticCard.css
│   │   │   │   │   ├── organisms
│   │   │   │   │   │   ├── StatisticSourceView.tsx
│   │   │   │   │   │   └── statisticSourceView.css
│   │   │   │   │   └── templates
│   │   │   │   │       └── widget
│   │   │   │   │           ├── tasksActivity
│   │   │   │   │           │   ├── TasksActivityWidget.tsx
│   │   │   │   │           │   ├── TasksActivityWidget.widget.meta.ts
│   │   │   │   │           │   └── tasksActivity.config.ts
│   │   │   │   │           ├── tasksProgress
│   │   │   │   │           │   ├── TasksProgressWidget.tsx
│   │   │   │   │           │   ├── TasksProgressWidget.widget.meta.ts
│   │   │   │   │           │   └── tasksProgress.config.ts
│   │   │   │   │           ├── tasksPunctuality
│   │   │   │   │           │   ├── TasksPunctualityWidget.tsx
│   │   │   │   │           │   ├── TasksPunctualityWidget.widget.meta.ts
│   │   │   │   │           │   └── tasksPunctuality.config.ts
│   │   │   │   │           ├── tasksWorkload
│   │   │   │   │           │   ├── TasksWorkloadWidget.tsx
│   │   │   │   │           │   ├── TasksWorkloadWidget.widget.meta.ts
│   │   │   │   │           │   └── tasksWorkload.config.ts
│   │   │   │   │           └── statisticWidgets.test.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── statistic.rules.test.ts
│   │   │   │   │   ├── statistic.rules.ts
│   │   │   │   │   ├── statistic.types.ts
│   │   │   │   │   ├── statisticRegistry.test.ts
│   │   │   │   │   └── statisticRegistry.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── statisticDiscovery.test.ts
│   │   │   │   │   └── statisticDiscovery.ts
│   │   │   │   └── presentation
│   │   │   │       └── hooks
│   │   │   │           └── useNow.ts
│   │   │   ├── task
│   │   │   │   ├── app
│   │   │   │   │   ├── task.service.ts
│   │   │   │   │   └── taskRepository.interface.ts
│   │   │   │   ├── components
│   │   │   │   │   └── templates
│   │   │   │   │       └── widget
│   │   │   │   │           ├── AddTask.tsx
│   │   │   │   │           ├── TaskWidget.tsx
│   │   │   │   │           ├── TaskWidget.widget.meta.ts
│   │   │   │   │           ├── UpcomingDeadlinesWidget.tsx
│   │   │   │   │           ├── UpcomingDeadlinesWidget.widget.meta.ts
│   │   │   │   │           ├── addTask.css
│   │   │   │   │           ├── taskWidget.css
│   │   │   │   │           └── upcomingDeadLine.css
│   │   │   │   ├── domain
│   │   │   │   │   ├── task.entity.ts
│   │   │   │   │   ├── task.mapper.ts
│   │   │   │   │   └── task.rule.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   ├── task.converter.ts
│   │   │   │   │   ├── taskRepository.firebase.ts
│   │   │   │   │   └── taskRepository.trpc.ts
│   │   │   │   ├── presentation
│   │   │   │   │   ├── context
│   │   │   │   │   │   ├── TasksContext.tsx
│   │   │   │   │   │   └── taskReducer.ts
│   │   │   │   │   └── hooks
│   │   │   │   │       └── useTask.ts
│   │   │   │   ├── statistic
│   │   │   │   │   └── taskMetric.ts
│   │   │   │   └── statistics
│   │   │   │       ├── task.statistic.source.test.ts
│   │   │   │       ├── task.statistic.source.ts
│   │   │   │       ├── taskMetrics.test.ts
│   │   │   │       ├── taskMetrics.ts
│   │   │   │       ├── taskTestUtils.ts
│   │   │   │       └── useTaskStatisticsInput.ts
│   │   │   └── widgets
│   │   │       ├── app
│   │   │       │   ├── widget.service.ts
│   │   │       │   └── widgetRepository.interface.ts
│   │   │       ├── components
│   │   │       │   └── templates
│   │   │       │       ├── base
│   │   │       │       │   ├── component
│   │   │       │       │   │   └── widgetComponentCache.ts
│   │   │       │       │   ├── container
│   │   │       │       │   │   ├── WidgetContainer.tsx
│   │   │       │       │   │   ├── WidgetErrorBoundary.tsx
│   │   │       │       │   │   ├── utils.tsx
│   │   │       │       │   │   └── widgetContainer.css
│   │   │       │       │   ├── content
│   │   │       │       │   │   └── WidgetContent.tsx
│   │   │       │       │   ├── dragPreview
│   │   │       │       │   │   └── dragPreview.tsx
│   │   │       │       │   ├── errorBoundary
│   │   │       │       │   │   └── WidgetErrorBoundary.tsx
│   │   │       │       │   ├── preview
│   │   │       │       │   │   └── widgetPreview.tsx
│   │   │       │       │   ├── renderer
│   │   │       │       │   │   ├── WidgetRenderer.test.tsx
│   │   │       │       │   │   └── WidgetRenderer.tsx
│   │   │       │       │   ├── skeleton
│   │   │       │       │   │   ├── WidgetSkeleton.tsx
│   │   │       │       │   │   └── widgetSkeleton.css
│   │   │       │       │   └── unknown
│   │   │       │       │       └── UnknownWidget.tsx
│   │   │       │       ├── exam
│   │   │       │       │   └── examList.tsx
│   │   │       │       ├── examsTimeline
│   │   │       │       │   ├── examsTimelineWidget.css
│   │   │       │       │   ├── examsTimelineWidget.tsx
│   │   │       │       │   └── examsTimelineWidget.types.ts
│   │   │       │       ├── modWidget
│   │   │       │       │   ├── addWidget.css
│   │   │       │       │   ├── addWidget.tsx
│   │   │       │       │   └── delWidget.tsx
│   │   │       │       └── upcomingDeadLine
│   │   │       │           ├── upcomingDeadLine.css
│   │   │       │           └── upcomingDeadLine.tsx
│   │   │       ├── domain
│   │   │       │   ├── widget.entity.ts
│   │   │       │   ├── widget.rules.ts
│   │   │       │   ├── widgetDefinition.types.ts
│   │   │       │   ├── widgetRegistry.test.ts
│   │   │       │   ├── widgetRegistry.ts
│   │   │       │   └── widgetTemplates.ts
│   │   │       ├── infrastructure
│   │   │       │   ├── widget.converter.ts
│   │   │       │   ├── widgetDiscovery.test.ts
│   │   │       │   ├── widgetDiscovery.ts
│   │   │       │   ├── widgetRepository.firebase.ts
│   │   │       │   └── widgetRepository.trpc.ts
│   │   │       └── presentation
│   │   │           ├── context
│   │   │           │   ├── widgetReducer.ts
│   │   │           │   └── widgetsContext.tsx
│   │   │           └── hooks
│   │   │               └── useWidgets.ts
│   │   ├── shared
│   │   │   ├── infrastructure
│   │   │   │   ├── api
│   │   │   │   └── firebase
│   │   │   │       └── withoutId.ts
│   │   │   ├── notifications
│   │   │   ├── themes
│   │   │   │   ├── domain
│   │   │   │   │   ├── theme.entity.ts
│   │   │   │   │   ├── theme.preset.ts
│   │   │   │   │   └── theme.rules.ts
│   │   │   │   ├── infrastructure
│   │   │   │   │   └── themeRepository.firebase.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   └── themeContext.tsx
│   │   │   │       └── hooks
│   │   │   │           └── useTheme.tsx
│   │   │   ├── types
│   │   │   ├── ui
│   │   │   │   └── atoms
│   │   │   │       ├── icons.tsx
│   │   │   │       └── utils.ts
│   │   │   └── utils
│   │   ├── test
│   │   │   └── setupTests.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .dockerignore
│   ├── .eslintrc.json
│   ├── .hintrc
│   ├── .prettierrc.json
│   ├── CHANGELOG.md
│   ├── Dockerfile
│   ├── README.md
│   ├── eslint.config.js
│   ├── example.env
│   ├── index.html
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite-env.d.ts
│   ├── vite.config.ts
│   └── vitest.config.ts
├── .gitignore
├── CHANGELOG.md
├── README.md
├── cloudbuild.yaml
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── service.json
```

---
*Generated by FileTree Pro Extension*