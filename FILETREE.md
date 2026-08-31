# File Tree: TheTavlo

```
├── backend
│   ├── src
│   │   ├── features
│   │   │   └── invitations
│   │   │       └── invitations.router.ts
│   │   ├── firebase
│   │   │   └── config.ts
│   │   ├── router
│   │   │   ├── api.ts
│   │   │   └── user.ts
│   │   ├── services
│   │   │   └── resend.ts
│   │   ├── trpc
│   │   │   ├── context.ts
│   │   │   ├── root.router.ts
│   │   │   ├── trpc.ts
│   │   │   └── validate.ts
│   │   ├── example.http
│   │   └── index.ts
│   ├── example.env
│   ├── nodemon.json
│   ├── package-lock.json
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
│   │   └── TheTavlo_logo_favicon_light.ico
│   ├── src
│   │   ├── assets
│   │   │   └── TheTavlo logo.svg
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
│   │   │   │   └── tags
│   │   │   │       ├── Tag.tsx
│   │   │   │       └── Tag.types.ts
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
│   │   │   │   │   └── index.ts
│   │   │   │   └── panelLocationBar
│   │   │   │       ├── panelLocationBar.css
│   │   │   │       └── panelLocationBar.tsx
│   │   │   ├── pages
│   │   │   │   ├── error
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   └── style.css
│   │   │   │   ├── Comming.tsx
│   │   │   │   ├── HomePage.test.tsx
│   │   │   │   ├── HomePage.tsx
│   │   │   │   ├── LandingPage.css
│   │   │   │   ├── LandingPage.tsx
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
│   │   │   │       ├── modShared
│   │   │   │       │   ├── addShared.css
│   │   │   │       │   ├── addShared.tsx
│   │   │   │       │   └── addShared.type.ts
│   │   │   │       └── modWidget
│   │   │   │           ├── addWidget.css
│   │   │   │           ├── addWidget.tsx
│   │   │   │           └── delWidget.tsx
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
│   │   │   │   └── infraestructure
│   │   │   │       ├── api
│   │   │   │       │   └── trpcClient.ts
│   │   │   │       └── firebase
│   │   │   │           └── withoutId.ts
│   │   │   ├── auth
│   │   │   │   ├── app
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── authRepository.interface.ts
│   │   │   │   │   └── migrationRepository.interface.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── migration.entity.ts
│   │   │   │   │   └── user.entity.ts
│   │   │   │   ├── infraestructure
│   │   │   │   │   ├── authRepository.firebase.ts
│   │   │   │   │   └── migrationRepository.firebase.ts
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
│   │   │   ├── cookingBook
│   │   │   │   ├── app
│   │   │   │   │   ├── CookingBook.interface.ts
│   │   │   │   │   └── CookingBook.service.ts
│   │   │   │   ├── components
│   │   │   │   │   └── template
│   │   │   │   │       └── widget
│   │   │   │   │           ├── CookingBook.tsx
│   │   │   │   │           └── CookingBook.type.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── CookingBook.entity.ts
│   │   │   │   │   ├── CookingRecipe.entity.ts
│   │   │   │   │   └── CookingRecipe.rules.ts
│   │   │   │   ├── infraestructure
│   │   │   │   │   ├── CookingBookRepository.firebase.ts
│   │   │   │   │   └── cookingBook.converter.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── CookingBookReducer.ts
│   │   │   │       │   └── CookingContext.tsx
│   │   │   │       └── hooks
│   │   │   │           └── useCookingBook.ts
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
│   │   │   │   │       └── dialog
│   │   │   │   │           └── events
│   │   │   │   │               └── add
│   │   │   │   │                   ├── AddEvent.tsx
│   │   │   │   │                   └── AddEvent.type.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── calendarEvent.entity.ts
│   │   │   │   │   └── events.entity.ts
│   │   │   │   ├── infraestructure
│   │   │   │   │   ├── event.converter.ts
│   │   │   │   │   └── eventRepository.firebase.ts
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
│   │   │   │   ├── infraestructure
│   │   │   │   │   ├── invitation.converter.ts
│   │   │   │   │   ├── invitationApiClient.ts
│   │   │   │   │   └── invitationRepository.firebase.ts
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
│   │   │   │   ├── infraestructure
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       └── hooks
│   │   │   ├── note
│   │   │   │   ├── app
│   │   │   │   │   ├── noteRepository.interface.ts
│   │   │   │   │   └── notes.service.ts
│   │   │   │   ├── components
│   │   │   │   │   └── templates
│   │   │   │   │       ├── modal
│   │   │   │   │       │   ├── addNote
│   │   │   │   │       │   │   └── index.tsx
│   │   │   │   │       │   └── delNote
│   │   │   │   │       │       └── index.tsx
│   │   │   │   │       └── widget
│   │   │   │   │           └── Note.widget.tsx
│   │   │   │   ├── domain
│   │   │   │   │   └── note.entity.ts
│   │   │   │   ├── infraestructure
│   │   │   │   │   ├── note.converter.ts
│   │   │   │   │   └── noteRepository.firebase.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── noteContext.tsx
│   │   │   │       │   ├── noteContext.type.ts
│   │   │   │       │   └── noteReducer.ts
│   │   │   │       └── hooks
│   │   │   │           └── useNotes.tsx
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
│   │   │   │   ├── infraestructure
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
│   │   │   │   ├── infraestructure
│   │   │   │   │   ├── __fixtures__
│   │   │   │   │   │   └── fakePanelRepository.ts
│   │   │   │   │   ├── panel.converter.ts
│   │   │   │   │   ├── panelRepository.cached.test.ts
│   │   │   │   │   ├── panelRepository.cached.ts
│   │   │   │   │   ├── panelRepository.firebase.ts
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
│   │   │   ├── schedule
│   │   │   │   ├── app
│   │   │   │   │   ├── schedule.service.test.ts
│   │   │   │   │   ├── schedule.service.ts
│   │   │   │   │   └── scheduleRepository.interface.ts
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
│   │   │   │   └── infraestructure
│   │   │   │       ├── __fixtures__
│   │   │   │       │   └── fakeScheduleRepository.ts
│   │   │   │       ├── schedule.converters.ts
│   │   │   │       ├── scheduleCache.ts
│   │   │   │       ├── scheduleRepository.cached.test.ts
│   │   │   │       ├── scheduleRepository.cached.ts
│   │   │   │       └── scheduleRepository.firebase.ts
│   │   │   ├── task
│   │   │   │   ├── app
│   │   │   │   │   ├── task.service.ts
│   │   │   │   │   └── taskRepository.interface.ts
│   │   │   │   ├── domain
│   │   │   │   │   ├── task.entity.ts
│   │   │   │   │   ├── task.mapper.ts
│   │   │   │   │   └── task.rule.ts
│   │   │   │   ├── infraestructure
│   │   │   │   │   ├── task.converter.ts
│   │   │   │   │   └── taskRepository.firebase.ts
│   │   │   │   └── presentation
│   │   │   │       ├── context
│   │   │   │       │   ├── TasksContext.tsx
│   │   │   │       │   └── taskReducer.ts
│   │   │   │       └── hooks
│   │   │   │           └── useTask.ts
│   │   │   └── widgets
│   │   │       ├── app
│   │   │       │   ├── widget.service.ts
│   │   │       │   └── widgetRepository.interface.ts
│   │   │       ├── components
│   │   │       │   └── templates
│   │   │       │       ├── base
│   │   │       │       │   ├── container
│   │   │       │       │   │   ├── WidgetContainer.tsx
│   │   │       │       │   │   ├── utils.tsx
│   │   │       │       │   │   └── widgetContainer.css
│   │   │       │       │   ├── content
│   │   │       │       │   │   └── WidgetContent.tsx
│   │   │       │       │   ├── dragPreview
│   │   │       │       │   │   └── dragPreview.tsx
│   │   │       │       │   └── preview
│   │   │       │       │       └── widgetPreview.tsx
│   │   │       │       ├── exam
│   │   │       │       │   └── examList.tsx
│   │   │       │       ├── examsTimeline
│   │   │       │       │   ├── examsTimelineWidget.css
│   │   │       │       │   ├── examsTimelineWidget.tsx
│   │   │       │       │   └── examsTimelineWidget.types.ts
│   │   │       │       ├── task
│   │   │       │       │   ├── addTask.css
│   │   │       │       │   ├── addTask.tsx
│   │   │       │       │   ├── taskWidget.css
│   │   │       │       │   └── taskWidget.tsx
│   │   │       │       ├── upcomingDeadLine
│   │   │       │       │   ├── upcomingDeadLine.css
│   │   │       │       │   └── upcomingDeadLine.tsx
│   │   │       │       └── index.ts
│   │   │       ├── domain
│   │   │       │   ├── widget.entity.ts
│   │   │       │   ├── widget.rules.ts
│   │   │       │   └── widgetTemplates.ts
│   │   │       ├── infraestructure
│   │   │       │   ├── widget.converter.ts
│   │   │       │   └── widgetRepository.firebase.ts
│   │   │       └── presentation
│   │   │           ├── context
│   │   │           │   ├── widgetReducer.ts
│   │   │           │   └── widgetsContext.tsx
│   │   │           └── hooks
│   │   │               └── useWidgets.ts
│   │   ├── shared
│   │   │   ├── infraestructure
│   │   │   │   ├── api
│   │   │   │   │   └── trpcClient.ts
│   │   │   │   └── firebase
│   │   │   │       ├── firebaseConfig.ts
│   │   │   │       └── withoutId.ts
│   │   │   ├── notifications
│   │   │   ├── themes
│   │   │   │   ├── domain
│   │   │   │   │   ├── theme.entity.ts
│   │   │   │   │   ├── theme.preset.ts
│   │   │   │   │   └── theme.rules.ts
│   │   │   │   ├── infraestructure
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
│   │   │   │       ├── iconsMap.ts
│   │   │   │       └── utils.ts
│   │   │   └── utils
│   │   ├── test
│   │   │   └── setupTests.ts
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .hintrc
│   ├── CHANGELOG.md
│   ├── README.md
│   ├── eslint.config.js
│   ├── example.env
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── pnpm-workspace.yaml
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── .gitignore
├── pnpm-workspace.yaml
└── vercel.json
```

---
*Generated by FileTree Pro Extension*