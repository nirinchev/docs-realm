Follow these steps to add the Realm .NET SDK to your project.

.. important:: Install the SDK for all projects

   If you have a multi-platform solution, be sure to install the SDK for 
   **all of the platform projects**, even if the given project doesn't contain 
   any Realm-specific code. 

.. tabs::

   .. tab:: Visual Studio for Mac
      :tabid: vs-mac

      .. procedure::

         .. step:: Open the NuGet Package Manager

            In the Solution Explorer, right-click your solution and select 
            :guilabel:`Manage NuGet Packages...` to open the NuGet
            Package management window.

            .. figure:: /images/vs-mac-nuget.png
               :alt: Open the NuGet Package management window.
               :lightbox:

            .. note::

               Adding the package at the Solution level allows you to add 
               it to every project in one step.

         .. step:: Add the Realm Package

            In the search bar, search for **Realm**. Select the
            result and click :guilabel:`Add Package`. When prompted,
            select all projects and click :guilabel:`Ok`.

            .. figure:: /images/vs-mac-nuget-search.png
               :alt: Search for Realm and add it to your project(s).
               :lightbox:


   .. tab:: Visual Studio on Windows
      :tabid: vs-win

      .. procedure::

         .. step:: Open the NuGet Package Manager

            In the Solution Explorer, right-click your solution and
            select :guilabel:`Manage NuGet Packages for Solution...`
            to open the NuGet Package management window.

            .. figure:: /images/vs-win-nuget.png
               :alt: Open the NuGet Package management window.
               :lightbox:


         .. step:: Add the Realm Package


            In the search bar, search for **Realm**. Select the
            result and click :guilabel:`Install`. When prompted,
            select all projects and click :guilabel:`Ok`.

            .. figure:: /images/vs-win-nuget-search.png
               :alt: Search for Realm and add it to your project(s).
               :lightbox:


         .. step:: Add the Realm Weaver to FodyWeavers.xml

            .. include:: /includes/add-realm-fody-weaver.rst
