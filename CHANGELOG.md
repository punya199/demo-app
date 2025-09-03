## [1.5.3](https://github.com/punya199/demo-app/compare/v1.5.2...v1.5.3) (2025-09-03)


### Fix

* Configures Dayjs for timezone support ([ca5c591](https://github.com/punya199/demo-app/commit/ca5c5916d5a1b69027385f9778235298e5e32451))

## [1.5.2](https://github.com/punya199/demo-app/compare/v1.5.1...v1.5.2) (2025-09-03)


### Fix

* Removes authorization check for house rent summary ([d805076](https://github.com/punya199/demo-app/commit/d805076583a3ec747f4ad427c01a45d723c4a41a))

## [1.5.1](https://github.com/punya199/demo-app/compare/v1.5.0...v1.5.1) (2025-09-03)


### Fix

* Removes redundant class from container. ([89c5577](https://github.com/punya199/demo-app/commit/89c5577445464ecc2e2e892f6d7b0d8e50bdd55d))

# [1.5.0](https://github.com/punya199/demo-app/compare/v1.4.7...v1.5.0) (2025-09-03)


### Fix

* Adds house rent summary page ([412f9b1](https://github.com/punya199/demo-app/commit/412f9b1e6baffc878534c829fc461eb4b8d453ea))

### Update

* setup kiro ([6a187b4](https://github.com/punya199/demo-app/commit/6a187b455174535129e015303b03a657c7cc2b60))

## [1.4.7](https://github.com/punya199/demo-app/compare/v1.4.6...v1.4.7) (2025-09-01)


### Fix

* HouseRentForm to use Ant Design Form ([b9f1ee9](https://github.com/punya199/demo-app/commit/b9f1ee9a0a916aacb43d80ecdb1a6ee35112e4db))

## [1.4.6](https://github.com/punya199/demo-app/compare/v1.4.5...v1.4.6) (2025-08-18)


### Fix

* Clean up App.css by removing unused CSS variables and styles. Update App.tsx to include new border radius for primary color. Enhance PageSaveBillToImage with navigation functionality and improve layout in Omama game components for better user experience. ([1f8a6c7](https://github.com/punya199/demo-app/commit/1f8a6c73b4fe20391b70257c1f99871717ccbe3f))

## [1.4.5](https://github.com/punya199/demo-app/compare/v1.4.4...v1.4.5) (2025-08-16)


### Fix

* AppUploadFiles component: Refactor access token retrieval to use useAuthStore for improved state management and dependency handling in headers, enhancing authentication flow. ([4a29eb2](https://github.com/punya199/demo-app/commit/4a29eb2c6b2e232f52a81bf847caadc15ceba7c4))

## [1.4.4](https://github.com/punya199/demo-app/compare/v1.4.3...v1.4.4) (2025-08-16)


### Fix

* user management: Add EnumUserStatus for user status representation, update IUser interface for better type safety, and improve user table with status display using tags. Also, include change-case library for string formatting. ([9592627](https://github.com/punya199/demo-app/commit/959262798400f66bfe9e9cb94c609cd28f693ba9))

## [1.4.3](https://github.com/punya199/demo-app/compare/v1.4.2...v1.4.3) (2025-08-16)


### Fix

* API client: Add response interceptor to handle 401 errors by clearing local storage and redirecting to login, improving authentication flow and user experience. ([90024e8](https://github.com/punya199/demo-app/commit/90024e83e611402755d6ba6d5db051b29742b3c7))

## [1.4.2](https://github.com/punya199/demo-app/compare/v1.4.1...v1.4.2) (2025-08-16)


### Fix

* type safety: Update fileList useMemo in AppUploadFiles component to specify UploadFile[] type, and add thumbnail URL to attachments in PageHouseRentDetail for improved image handling. ([67461ef](https://github.com/punya199/demo-app/commit/67461efd761c6265feba39bafc93bb5d3c2e871f))

## [1.4.1](https://github.com/punya199/demo-app/compare/v1.4.0...v1.4.1) (2025-08-16)


### Fix

* Replace navigate with Link component for house rent creation button, enhancing navigation consistency and improving code readability. ([dcff40a](https://github.com/punya199/demo-app/commit/dcff40a9aa1c73df6e2659272d167b0cce5f91ce))

# [1.4.0](https://github.com/punya199/demo-app/compare/v1.3.1...v1.4.0) (2025-08-16)


### Update

* authentication management: Introduce useAuthStore for centralized access token handling, refactor components to utilize the new store for authentication state, and improve permission checks in various components, streamlining user access control and enhancing overall code maintainability. ([ec6bd4a](https://github.com/punya199/demo-app/commit/ec6bd4a88d69bb8df8199f2aa979d0cca3590b3b))

## [1.3.1](https://github.com/punya199/demo-app/compare/v1.3.0...v1.3.1) (2025-08-16)


### Fix

* Update HouseRentDetailTableField and HouseRentMemberTableField components to use Typography.Title for summary displays and enhance form validation for unique member entries, improving UI consistency and data integrity. ([07de8f5](https://github.com/punya199/demo-app/commit/07de8f5e14f342e548fb8ca2027066169caa6b70))

# [1.3.0](https://github.com/punya199/demo-app/compare/v1.2.8...v1.3.0) (2025-08-16)


### Fix

* Update user role checks in multiple components to ensure safe access to user properties, preventing potential runtime errors. ([de5d719](https://github.com/punya199/demo-app/commit/de5d719e39d3c40700d83d9a3706a13a76dcdc0a))

### Update

* Implement role-based access control in house rent components by introducing the Authorize component. Update service to manage feature permissions and improve loading states with a new LoadingSpin component. Refactor house rent forms to support view modes based on user permissions. ([d3151a1](https://github.com/punya199/demo-app/commit/d3151a11abfbab0c1173c3c34ff07bd6d7c99b9d))

## [1.2.8](https://github.com/punya199/demo-app/compare/v1.2.7...v1.2.8) (2025-08-16)


### Fix

* Remove dependency on useGetMe for house rent list query and implement role-based access control for copy link functionality in PageHouseRent component. ([9d23e4d](https://github.com/punya199/demo-app/commit/9d23e4db8ed27a9886d058c901ac958880c6c148))
* Update Navbar component to include redirect state in login links for improved user experience. ([f07d671](https://github.com/punya199/demo-app/commit/f07d671c311f26339a99ddebf601b6d9ec091f53))

## [1.2.7](https://github.com/punya199/demo-app/compare/v1.2.6...v1.2.7) (2025-08-16)


### Fix

* edit house rent view mode ([c1a9e00](https://github.com/punya199/demo-app/commit/c1a9e006a58284da8551cf2e880b694754990034))

## [1.2.6](https://github.com/punya199/test1/compare/v1.2.5...v1.2.6) (2025-08-07)


### Fix

* Add new components for enhanced UI effects, including FlickeringGrid and TypingAnimation. Introduce components.json for configuration, update App.css for theming, and enhance Navbar and Login/Register pages with animations. Update package.json with new dependencies for improved styling and animations. ([ebca109](https://github.com/punya199/test1/commit/ebca109b0327255b661f9591aa4afb083f3715ab))
* Enhance Omama game UI by integrating Ant Design's App component in App.tsx and adding a new list to track recently drawn cards. Update card display and layout for improved user experience, including better styling and organization of game elements. ([c369207](https://github.com/punya199/test1/commit/c3692072f3ed3ff88bd0211cbb4cd100add0bc1c))

## [1.2.5](https://github.com/punya199/test1/compare/v1.2.4...v1.2.5) (2025-08-05)


### Fix

* Add @ant-design/icons dependency, implement EditCardTitle component for card title editing, and refactor AddPlayerOmama for improved player management. Update Omama game logic to utilize new state management and improve user experience. ([b44bf26](https://github.com/punya199/test1/commit/b44bf26e87eb6a2902823a4044c253f41fbec0e7))

## [1.2.4](https://github.com/punya199/test1/compare/v1.2.3...v1.2.4) (2025-08-04)


### Fix

* Consolidate card game logic into new CardGame component, migrate card data to a dedicated file, and update routing for Omama game. Remove obsolete project files and enhance Tailwind CSS configuration for cleaner styling. ([2a024bb](https://github.com/punya199/test1/commit/2a024bba76668edb57ce6042e08190aafdd6b087))

## [1.2.3](https://github.com/punya199/test1/compare/v1.2.2...v1.2.3) (2025-08-01)


### Fix

* Add user management and registration pages, enhance routing with new paths for user registration and management, and implement role-based access control in Navbar and PageAllBill components. Refactor helper functions for role checking. ([4502a4e](https://github.com/punya199/test1/commit/4502a4e78fb7a643b4ee62d2359fe6aafc33ca55))

## [1.2.2](https://github.com/punya199/test1/compare/v1.2.1...v1.2.2) (2025-07-31)


### Fix

* Introduce UserRole enum for role-based access control, update Navbar to conditionally render menu items based on user role, and implement delete functionality for house rent entries with confirmation modal. Refactor house rent page to support role-based actions. ([83a2df1](https://github.com/punya199/test1/commit/83a2df18e8629b92e5e2cae7c3a4321e51a47dc9))

## [1.2.1](https://github.com/punya199/test1/compare/v1.2.0...v1.2.1) (2025-07-31)


### Fix

* Implement lazy loading for components in App.tsx to improve performance and reduce initial load time. Update tsconfig.app.json to disable source maps for production builds. ([adbd72d](https://github.com/punya199/test1/commit/adbd72dbad82d4622efe3194681fa5a4ed2f0eaf))

# [1.2.0](https://github.com/punya199/test1/compare/v1.1.68...v1.2.0) (2025-07-31)


### Update

* Login component with useMutation for improved login handling, refactor onFinish to utilize mutation, and add sleep utility for delay. Update VSCode settings to include SQL formatter. ([7177f33](https://github.com/punya199/test1/commit/7177f3379e9b8a8010bccaabd22e07821758715d))

## [1.1.68](https://github.com/punya199/test1/compare/v1.1.67...v1.1.68) (2025-07-31)


### Fix

* Add html-to-image dependency for image export functionality, update routing paths for bill editing and viewing, and improve user navigation in Login and PageAllBill components. Refactor PageSaveBillToImage for better layout and image saving capabilities. ([06a59e0](https://github.com/punya199/test1/commit/06a59e01c88df884c1269d08c291dc79eab43ecb))

## [1.1.67](https://github.com/punya199/test1/compare/v1.1.66...v1.1.67) (2025-07-31)


### Fix

* Update event handler naming from onValueChange to onChange in CustomCell and related components for consistency. Enhance navigation logic in house rent detail pages to handle success and error states more effectively. ([409a453](https://github.com/punya199/test1/commit/409a45342b8113fda23cad2a9e42715d6cd52340))

## [1.1.66](https://github.com/punya199/test1/compare/v1.1.65...v1.1.66) (2025-07-31)


### Fix

* Configure QueryClient with custom options for query and mutation handling. Add NotFound component for improved error handling in house rent detail pages, replacing loading states with user-friendly messages. ([4139fe7](https://github.com/punya199/test1/commit/4139fe7338320bd31ff7937f1674dbaa6eb18c46))

## [1.1.65](https://github.com/punya199/test1/compare/v1.1.64...v1.1.65) (2025-07-31)


### Fix

* Implement lazy loading for house rent pages to optimize performance and improve user experience. Update navigation links in PageHouseRent to use React Router's Link component for better routing management. ([67f1fcc](https://github.com/punya199/test1/commit/67f1fcc64e2d251afb9ddb7a336f8d074354b496))

## [1.1.64](https://github.com/punya199/test1/compare/v1.1.63...v1.1.64) (2025-07-31)


### Fix

* Enhance house rent management by integrating user options fetching and updating rendering logic to display user names in reports. Refactor interfaces to support new user option structure. ([690d56d](https://github.com/punya199/test1/commit/690d56da2c8551c8487a30915b30dd2dc365f8e7))

## [1.1.63](https://github.com/punya199/test1/compare/v1.1.62...v1.1.63) (2025-07-31)


### Fix

* house rent management: Add user selection functionality in HouseRentMemberTableField, refactor interfaces to include user ID, and implement user options fetching. Update data handling and rendering logic for improved user experience. ([5591f61](https://github.com/punya199/test1/commit/5591f61aeded3b60c948002981c613b5af287eed))

## [1.1.62](https://github.com/punya199/test1/compare/v1.1.61...v1.1.62) (2025-07-30)


### Fix

* Introduce AppUploadFiles component for file uploads in house rent forms, refactor house rent interfaces to support new attachment structure, and integrate file upload functionality in HouseRentAttachments. Update form submission logic to handle attachment IDs. ([e48603a](https://github.com/punya199/test1/commit/e48603ab33d6a158596738241a99d04d110c0f2b))

## [1.1.61](https://github.com/punya199/test1/compare/v1.1.60...v1.1.61) (2025-07-29)


### Fix

* Update HouseRentForm to conditionally submit data based on user login status, enhancing form submission logic. ([193fd42](https://github.com/punya199/test1/commit/193fd427a7e676b108d2e9e90e2c8406f79759ab))

## [1.1.60](https://github.com/punya199/test1/compare/v1.1.59...v1.1.60) (2025-07-29)


### Fix

* house rent management: Add new pages for creating, viewing, and cloning house rent entries. Update routing and appPath configuration for new routes. Introduce house rent service and store for state management. Refactor house rent detail fields and improve data handling in forms. ([b122cca](https://github.com/punya199/test1/commit/b122cca6e9bcbafd832eeaf2a3ee585392c8165d))
* Remove ElectricitySummary component, rename IHouseRentPeopleData to IHouseRentMemberData, and update related components for consistency. Introduce HouseRentMemberTableField for managing member data and integrate file upload functionality in PageHouseRent. ([ef68558](https://github.com/punya199/test1/commit/ef6855894eaf94d6eee1c88bee20d27642f32c36))

## [1.1.59](https://github.com/punya199/test1/compare/v1.1.58...v1.1.59) (2025-07-29)


### Fix

* Implement detailed breakdown of bill payments among friends, including individual contributions and transaction summaries. Improve UI layout for better readability and user experience. ([20bdd1c](https://github.com/punya199/test1/commit/20bdd1c88d84e6687dd64971ad5d271b6d25249a))

## [1.1.58](https://github.com/punya199/test1/compare/v1.1.57...v1.1.58) (2025-07-29)


### Fix

* Integrate Emotion for styling, add house rent management features, and enhance responsive design. Introduced new components for house rent details, electricity summary, and report generation. Updated app configuration for development mode and improved state management with zustand. ([e75081d](https://github.com/punya199/test1/commit/e75081dca86ed617ec30a0f16dc6af8eae9835ca))

## [1.1.57](https://github.com/punya199/test1/compare/v1.1.56...v1.1.57) (2025-07-25)


### Fix

* Add PageSaveBillToImage for saving bills as images, update appPath for new routes, and improve CheckBill and PageAllBill components with better navigation and user experience adjustments. ([9f125fe](https://github.com/punya199/test1/commit/9f125fef2df3e05e926227bc20ef5d8581ed8377))

## [1.1.56](https://github.com/punya199/test1/compare/v1.1.55...v1.1.56) (2025-07-24)


### Fix

* Add dayjs for date handling, implement new PageCreateBill component, and enhance routing in Navbar and App components. Update CheckBill component for improved user experience and styling adjustments in PageAllBill. ([e5d5864](https://github.com/punya199/test1/commit/e5d5864bdb44d0cc556e904f01e8825bae531973))

## [1.1.55](https://github.com/punya199/test1/compare/v1.1.54...v1.1.55) (2025-07-23)


### Fix

* Enhance routing and state management: Introduce new pages for bill creation and editing, update appPath configuration for dynamic routing, and integrate zustand for state management in CheckBill component. Add dependencies for URL sanitization and query string handling. ([3ca0ab7](https://github.com/punya199/test1/commit/3ca0ab778a1e7d31166b92c1b09a51fd20689f53))

## [1.1.54](https://github.com/punya199/test1/compare/v1.1.53...v1.1.54) (2025-07-21)


### Fix

* Introduce appPath configuration for routing, update Navbar and App components to use new paths, and clean up unused routes. Simplify Home component by removing project link. ([69b9586](https://github.com/punya199/test1/commit/69b958664ec8fc41cf44133050df6b7b91f7397c))

## [1.1.53](https://github.com/punya199/test1/compare/v1.1.52...v1.1.53) (2025-07-18)


### Fix

* Update framer-motion to version 12.23.6, enhance styling in AddFriends and AddItem components, and implement character limit validation for friend and item names in PageCheckBill component. ([fb6402c](https://github.com/punya199/test1/commit/fb6402c501a4af3b3c916594b2cb5060ebf6f0f5))

## [1.1.52](https://github.com/punya199/test1/compare/v1.1.51...v1.1.52) (2025-07-17)


### Fix

* Enhance delete confirmation modal in PageCheckBill component and streamline friend removal logic for improved user experience. ([67bcbba](https://github.com/punya199/test1/commit/67bcbba4dab53127aaec2ebfe3984b92d666eea1))

## [1.1.51](https://github.com/punya199/test1/compare/v1.1.50...v1.1.51) (2025-07-17)


### Fix

* Add zustand for state management and refactor PageCheckBill component to utilize zustand store for items and friends, simplifying state handling. ([5333cc1](https://github.com/punya199/test1/commit/5333cc15aced618d9fabd527c8cd28e81276b12a))
* Update import statements in main.tsx, enhance layout and styling in AddFriends and AddItem components, and improve modal confirmation and notification handling in PageCheckBill component. ([47f28ec](https://github.com/punya199/test1/commit/47f28ec6d008e71c896ec4a73965b5c5da47cb57))

## [1.1.50](https://github.com/punya199/test1/compare/v1.1.49...v1.1.50) (2025-07-17)


### Fix

* downgrade react 19 to 18 ([1365e08](https://github.com/punya199/test1/commit/1365e08ddda5f6da51ef1fb2b2fd9214b727ee93))

## [1.1.49](https://github.com/punya199/test1/compare/v1.1.48...v1.1.49) (2025-07-09)


### Fix

* Refactor Login and PageCheckBill components to simplify API calls and state management. Add payerId and friendIds to Item interface in AddItem component for better data handling. ([82ad4df](https://github.com/punya199/test1/commit/82ad4df0e04d049eae8bf4d42d68f833daea632a))
* Refactor PageAbout component with improved layout and content, and optimize PageCheckBill component by using useCallback and useMemo for better performance ([0c6ee3f](https://github.com/punya199/test1/commit/0c6ee3f76b7e787856db7e2c41dc0b58080b8b9b))

## [1.1.48](https://github.com/punya199/test1/compare/v1.1.47...v1.1.48) (2025-07-08)


### Fix

* Remove console.log statements from Login and PageCheckBill components to clean up code ([7bf6886](https://github.com/punya199/test1/commit/7bf6886fe00e7d5f79c423eec2d79bdb9d0db6f5))

## [1.1.47](https://github.com/punya199/test1/compare/v1.1.46...v1.1.47) (2025-07-08)


### Fix

* Change document title to 'Yaya', add app version meta tag, and include environment configuration script ([8d95fc0](https://github.com/punya199/test1/commit/8d95fc0feb635fc7f0641ae58174fe17c850ba44))

## [1.1.46](https://github.com/punya199/test1/compare/v1.1.45...v1.1.46) (2025-07-08)


### Fix

* Add authentication with react-query, implement login functionality, and update UI components across the application ([28816a9](https://github.com/punya199/test1/commit/28816a9cb7f2888efb026ebde7cb4f15fd3b16c1))

## [1.1.45](https://github.com/punya199/test1/compare/v1.1.44...v1.1.45) (2025-07-07)


### Enhance

* Integrate react-number-format for numeric input and update UI components in Project 8 ([543cc4e](https://github.com/punya199/test1/commit/543cc4e8d03169c5402e7e52dbe68b3765c83690))

### Fix

* Remove lazy loading for CardGame and Omama components, update UI styles in Allprojects, and enhance PageCheckBill with transaction handling ([263cc13](https://github.com/punya199/test1/commit/263cc13b393a9a91319e5c51e74de3d3b52794e0))

## [1.1.44](https://github.com/punya199/test1/compare/v1.1.43...v1.1.44) (2025-07-01)


### Fix

* Update Project 8 and change foder Project ([2af968d](https://github.com/punya199/test1/commit/2af968d078ae5f634c6a4677741eee4ef058d6d0))

## [1.1.43](https://github.com/punya199/test1/compare/v1.1.42...v1.1.43) (2025-06-30)


### Fix

* update UI project 8 ([b88c0e1](https://github.com/punya199/test1/commit/b88c0e191671fce29b7a460bf9e8a63b4d524743))

## [1.1.42](https://github.com/punya199/test1/compare/v1.1.41...v1.1.42) (2025-06-30)


### Fix

* edit server error when eslint error ([0f541e3](https://github.com/punya199/test1/commit/0f541e3eef899e40162adec6a138683b9ebb4d27))

## [1.1.41](https://github.com/punya199/test1/compare/v1.1.40...v1.1.41) (2025-06-30)


### Fix

* refactor ([bc69e95](https://github.com/punya199/test1/commit/bc69e952e4588514d31be327e692f6aafe539e64))
* refactor ([92166ff](https://github.com/punya199/test1/commit/92166fffd7eedf9d3b2d742a04708615577c5d51))

## [1.1.40](https://github.com/punya199/test1/compare/v1.1.39...v1.1.40) (2025-06-30)


### Fix

* add prettier ([44a969a](https://github.com/punya199/test1/commit/44a969aa0e073f80e374763e611fc20cc04542f9))

## [1.1.39](https://github.com/punya199/test1/compare/v1.1.38...v1.1.39) (2025-06-30)


### Fix

* refactor ([a69eec0](https://github.com/punya199/test1/commit/a69eec06f64c320dbb662a04d18587b1e447b827))

## [1.1.38](https://github.com/punya199/test1/compare/v1.1.37...v1.1.38) (2025-06-26)


### Fix

* test ([8241a5d](https://github.com/punya199/test1/commit/8241a5dee066923542cde1081263471bf8ed08a2))

## [1.1.37](https://github.com/punya199/test1/compare/v1.1.36...v1.1.37) (2025-06-26)


### Fix

* test ([3dde205](https://github.com/punya199/test1/commit/3dde205b08ec3b770ebad0260269b4304182d9c2))

## [1.1.36](https://github.com/punya199/test1/compare/v1.1.35...v1.1.36) (2025-06-25)


### Fix

* test ([637f245](https://github.com/punya199/test1/commit/637f2459a40ef6e397ddc61ff9ac6c6052845725))

## [1.1.35](https://github.com/punya199/test1/compare/v1.1.34...v1.1.35) (2025-06-25)


### Fix

* test ([84465cd](https://github.com/punya199/test1/commit/84465cd50adabc7709e7062a67654804d51e707f))

## [1.1.34](https://github.com/punya199/test1/compare/v1.1.33...v1.1.34) (2025-06-25)


### Fix

* test ([866ce3a](https://github.com/punya199/test1/commit/866ce3a922b6c22091607efc9b905c2107f79d76))

## [1.1.33](https://github.com/punya199/test1/compare/v1.1.32...v1.1.33) (2025-06-25)


### Fix

* test ([1ed2e75](https://github.com/punya199/test1/commit/1ed2e756e5e8823ac9ef39a84a6a46688672fc49))

## [1.1.32](https://github.com/punya199/test1/compare/v1.1.31...v1.1.32) (2025-06-25)


### Fix

* test ([4bd7de1](https://github.com/punya199/test1/commit/4bd7de160264d712d0a843de52fba4d9a486c0ed))

## [1.1.31](https://github.com/punya199/test1/compare/v1.1.30...v1.1.31) (2025-06-25)


### Fix

* test ([1783766](https://github.com/punya199/test1/commit/17837668e9ec757a1f67983ae71c09216d47829f))

## [1.1.30](https://github.com/punya199/test1/compare/v1.1.29...v1.1.30) (2025-06-25)


### Fix

* edit yaya service ([a0446d4](https://github.com/punya199/test1/commit/a0446d469081f6ae2004550d4a9a0109cd16f34d))

## [1.1.29](https://github.com/punya199/test1/compare/v1.1.28...v1.1.29) (2025-06-24)


### Fix

* edit yaya service ([5fce38b](https://github.com/punya199/test1/commit/5fce38bb2d4cd577d927561f4f244378315968c6))

## [1.1.28](https://github.com/punya199/test1/compare/v1.1.27...v1.1.28) (2025-06-23)


### Fix

* edit yaya service ([0f6b9b2](https://github.com/punya199/test1/commit/0f6b9b288fafd6d0da37b5d9dc65096a3bf28a65))

## [1.1.27](https://github.com/punya199/test1/compare/v1.1.26...v1.1.27) (2025-06-23)


### Fix

* edit yaya service ([ba59b2d](https://github.com/punya199/test1/commit/ba59b2d93d083f783f925b5f7595d7fad5986d88))

## [1.1.26](https://github.com/punya199/test1/compare/v1.1.25...v1.1.26) (2025-06-23)


### Fix

* edit argo sync payload 2 ([ae44073](https://github.com/punya199/test1/commit/ae44073b0fdf8560d56a324620f12b9803a5fd23))

## [1.1.25](https://github.com/punya199/test1/compare/v1.1.24...v1.1.25) (2025-06-23)


### Fix

* edit argo sync payload ([6ef0636](https://github.com/punya199/test1/commit/6ef0636b8af3af3e8de89707c0fa6adc94ec379c))

## [1.1.24](https://github.com/punya199/test1/compare/v1.1.23...v1.1.24) (2025-06-23)


### Fix

* edit argo sync ([f1c4bdd](https://github.com/punya199/test1/commit/f1c4bddbec61cac3d05197a5eccb5d5264a2d66c))

## [1.1.23](https://github.com/punya199/test1/compare/v1.1.22...v1.1.23) (2025-06-23)


### Fix

* edit argo sync ([24b5227](https://github.com/punya199/test1/commit/24b522708a31014a36c59e097aafebcbe675ba18))

## [1.1.22](https://github.com/punya199/test1/compare/v1.1.21...v1.1.22) (2025-06-23)


### Fix

* remove text ([2cf5895](https://github.com/punya199/test1/commit/2cf58958182ac0e1365f28fb70de085fe9de5ead))

## [1.1.21](https://github.com/punya199/test1/compare/v1.1.20...v1.1.21) (2025-06-23)


### Fix

* remove text ([ac55b2a](https://github.com/punya199/test1/commit/ac55b2a2f11bc2b6d5b757472667f15e9b7d4ece))

## [1.1.20](https://github.com/punya199/test1/compare/v1.1.19...v1.1.20) (2025-06-23)


### Fix

* test ([6409a27](https://github.com/punya199/test1/commit/6409a277d9cfe2f2dc390aa64aaeee1ef914287a))

## [1.1.19](https://github.com/punya199/test1/compare/v1.1.18...v1.1.19) (2025-05-29)


### Fix

* edit cd ([b26dfb6](https://github.com/punya199/test1/commit/b26dfb680d669c57fded2925e02d2d797ca5fd47))

## [1.1.18](https://github.com/punya199/test1/compare/v1.1.17...v1.1.18) (2025-05-29)


### Fix

* edit ci ([39ad99c](https://github.com/punya199/test1/commit/39ad99c0d186495b92eeea8911dbd578983a7f2e))
* edit ci ([e94b7a1](https://github.com/punya199/test1/commit/e94b7a140f50355eb00d81d75edca099aee308c7))

## [1.1.17](https://github.com/punya199/test1/compare/v1.1.16...v1.1.17) (2025-05-29)


### Fix

* no console ([7827e1e](https://github.com/punya199/test1/commit/7827e1ef76d69c1b8abbf3806405b05368558929))

## [1.1.16](https://github.com/punya199/test1/compare/v1.1.15...v1.1.16) (2025-05-29)


### Fix

* edit chuck bundle assets image cards ([3fe96db](https://github.com/punya199/test1/commit/3fe96db8c9c776e3fed5952a3a48fde9d2ce2da7))

## [1.1.15](https://github.com/punya199/test1/compare/v1.1.14...v1.1.15) (2025-05-29)


### Fix

* refactor ([5032c10](https://github.com/punya199/test1/commit/5032c10e061b1e6d94b9579efccae71b03337528))

## [1.1.14](https://github.com/punya199/test1/compare/v1.1.13...v1.1.14) (2025-05-29)


### Fix

* change image png to webp ([612b185](https://github.com/punya199/test1/commit/612b1856ac65763bc7a834665b636bc5ff006b79))

## [1.1.13](https://github.com/punya199/test1/compare/v1.1.12...v1.1.13) (2025-05-29)


### Fix

* edit text home ([254fff1](https://github.com/punya199/test1/commit/254fff10f408b472ed48db071d26ba4b51ee37ce))

## [1.1.12](https://github.com/punya199/test1/compare/v1.1.11...v1.1.12) (2025-05-29)


### Fix

* edit ci ([47a7123](https://github.com/punya199/test1/commit/47a71236d428800d85905fd8e39cfefedd6e2323))

## [1.1.11](https://github.com/punya199/test1/compare/v1.1.10...v1.1.11) (2025-05-29)


### Fix

* edit dockerfiel ([b5d1719](https://github.com/punya199/test1/commit/b5d171927f739de13ff8b01d5ab1bcf2acdf4f78))

## [1.1.10](https://github.com/punya199/test1/compare/v1.1.9...v1.1.10) (2025-05-29)


### Fix

* edit cd ([60a03a2](https://github.com/punya199/test1/commit/60a03a24ac0219c8028e75853c485426a15a1aed))

## [1.1.9](https://github.com/punya199/test1/compare/v1.1.8...v1.1.9) (2025-05-29)


### Fix

* edit cd ([6f3b784](https://github.com/punya199/test1/commit/6f3b784d9aa5465c86199686e4f01610aa6f49df))

## [1.1.8](https://github.com/punya199/test1/compare/v1.1.7...v1.1.8) (2025-05-29)


### Fix

* cd deploy koyeb ([6a48448](https://github.com/punya199/test1/commit/6a48448c30590d1a0a27caffc736a2d1bf4cdd64))

## [1.1.7](https://github.com/punya199/test1/compare/v1.1.6...v1.1.7) (2025-05-29)


### Fix

* add app version ([375aa64](https://github.com/punya199/test1/commit/375aa64d0c91d7b7eedd010ebc2ca41102285bd2))

## [1.1.6](https://github.com/punya199/test1/compare/v1.1.5...v1.1.6) (2025-05-29)


### Fix

* edit something ([328abfc](https://github.com/punya199/test1/commit/328abfc47a90d259dd054f1d8ca0c8445792e3ce))

## [1.1.5](https://github.com/punya199/test1/compare/v1.1.4...v1.1.5) (2025-05-29)


### Fix

* edit ([01cbb80](https://github.com/punya199/test1/commit/01cbb80dc6d2ed821a43282273a357dbc0e3b1bc))
* remove new ci ([88f2d60](https://github.com/punya199/test1/commit/88f2d60e489200d7c62b1f835582e35153193b94))

## [1.1.3](https://github.com/punya199/test1/compare/v1.1.2...v1.1.3) (2025-05-29)


### Fix

* Updates display text on the home page. ([a6c2be0](https://github.com/punya199/test1/commit/a6c2be085d7ae9f2ad232154ddf7020be3868d5b))

## [1.1.2](https://github.com/punya199/test1/compare/v1.1.1...v1.1.2) (2025-05-29)


### Fix

* Adds package*.json to Prettier ignore list ([8b8c45a](https://github.com/punya199/test1/commit/8b8c45a2e35f0318c67b2e25d46f8315fe22a859))

## [1.1.1](https://github.com/punya199/test1/compare/v1.1.0...v1.1.1) (2025-05-29)


### Fix

* add husky + lint staged ([5f6728a](https://github.com/punya199/test1/commit/5f6728ac03763b4758b4bcfcbae335a119b784d3))
* add husky + lint staged ([8df8321](https://github.com/punya199/test1/commit/8df8321742bed0d6a2692747aaeef97a8b79dea6))
* add script release version ([85cc902](https://github.com/punya199/test1/commit/85cc902070c1f753b5ebfd7a5ea414113c164bc7))
* update eslint rules ([6cc3846](https://github.com/punya199/test1/commit/6cc3846a66356ccef936360b9f392ea0fd1228bf))

## [1.1.1](https://github.com/punya199/test1/compare/v1.1.0...v1.1.1) (2025-05-29)


### Fix

* add husky + lint staged ([5f6728a](https://github.com/punya199/test1/commit/5f6728ac03763b4758b4bcfcbae335a119b784d3))
* add husky + lint staged ([8df8321](https://github.com/punya199/test1/commit/8df8321742bed0d6a2692747aaeef97a8b79dea6))
* add script release version ([85cc902](https://github.com/punya199/test1/commit/85cc902070c1f753b5ebfd7a5ea414113c164bc7))
* update eslint rules ([6cc3846](https://github.com/punya199/test1/commit/6cc3846a66356ccef936360b9f392ea0fd1228bf))

## [1.1.1](https://github.com/punya199/test1/compare/v1.1.0...v1.1.1) (2025-05-29)


### Fix

* add husky + lint staged ([5f6728a](https://github.com/punya199/test1/commit/5f6728ac03763b4758b4bcfcbae335a119b784d3))
* add husky + lint staged ([8df8321](https://github.com/punya199/test1/commit/8df8321742bed0d6a2692747aaeef97a8b79dea6))
* add script release version ([85cc902](https://github.com/punya199/test1/commit/85cc902070c1f753b5ebfd7a5ea414113c164bc7))
* update eslint rules ([6cc3846](https://github.com/punya199/test1/commit/6cc3846a66356ccef936360b9f392ea0fd1228bf))

## [1.1.1](https://github.com/punya199/test1/compare/v1.1.0...v1.1.1) (2025-05-29)


### Fix

* add husky + lint staged ([5f6728a](https://github.com/punya199/test1/commit/5f6728ac03763b4758b4bcfcbae335a119b784d3))
* add husky + lint staged ([8df8321](https://github.com/punya199/test1/commit/8df8321742bed0d6a2692747aaeef97a8b79dea6))
* add script release version ([85cc902](https://github.com/punya199/test1/commit/85cc902070c1f753b5ebfd7a5ea414113c164bc7))
* update eslint rules ([6cc3846](https://github.com/punya199/test1/commit/6cc3846a66356ccef936360b9f392ea0fd1228bf))
